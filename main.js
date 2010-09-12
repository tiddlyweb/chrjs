// TiddlyWeb adaptor
// v0.9.2
//
// TODO:
// * ensure all routes are supported
// * documentation

(function($) {

tiddlyweb = {
	routes: {
		// host is the TiddlyWeb instance's URI (including server_prefix)
		// placeholders "_type" & "name" refer to the respective bag/recipe
		root     : "{host}/",
		bags     : "{host}/bags",
		bag      : "{host}/bags/{name}",
		recipes  : "{host}/recipes",
		recipe   : "{host}/recipes/{name}",
		tiddlers : "{host}/{_type}s/{name}/tiddlers",
		tiddler  : "{host}/{_type}s/{name}/tiddlers/{title}",
		revisions: "{host}/{_type}s/{name}/tiddlers/{title}/revisions",
		revision : "{host}/{_type}s/{name}/tiddlers/{title}/revisions/{revision}",
		search   : "{host}/search?q={query}"
	}
};

// host (optional) is the URI of the originating TiddlyWeb instance
tiddlyweb.Resource = function(type, host) {
	if(arguments.length) { // initialization
		this._type = type; // XXX: somewhat redundant, as it generally corresponds to class name
		if(host !== false) {
			this.host = host !== undefined ? host.replace(/\/$/, "") : null;
		}
	}
};
$.extend(tiddlyweb.Resource.prototype, {
	// retrieves resource from server
	// callback is passed resource, status, XHR (cf. jQuery.ajax success)
	// errback is passed XHR, error, exception, resource (cf. jQuery.ajax error)
	// filters is a filter string (e.g. "select=tag:foo;limit=5")
	get: function(callback, errback, filters) {
		var uri = this.route();
		if(filters) {
			var separator = uri.indexOf("?") == -1 ? "?" : ";";
			uri += separator + filters;
		}
		var self = this;
		return $.ajax({
			url: uri,
			type: "GET",
			dataType: "json",
			success: function(data, status, xhr) {
				var resource = self.parse(data);
				callback(resource, status, xhr);
			},
			error: function(xhr, error, exc) {
				errback(xhr, error, exc, self);
			}
		});
	},
	// sends resource to server
	// callback is passed data, status, XHR (cf. jQuery.ajax success)
	// errback is passed XHR, error, exception, resource (cf. jQuery.ajax error)
	put: function(callback, errback) {
		var uri = this.route();
		var data = {};
		var self = this;
		$.each(this.data, function(i, item) {
			var value = self[item];
			if(value !== undefined) {
				data[item] = value;
			}
		});
		return $.ajax({
			url: uri,
			type: "PUT",
			contentType: "application/json",
			data: $.toJSON(data),
			success: callback,
			error: function(xhr, error, exc) {
				errback(xhr, error, exc, self);
			}
		});
	},
	// deletes resource on server
	// callback is passed data, status, XHR (cf. jQuery.ajax success)
	// errback is passed XHR, error, exception, resource (cf. jQuery.ajax error)
	"delete": function(callback, errback) {
		var uri = this.route();
		var self = this;
		return $.ajax({
			url: uri,
			type: "DELETE",
			success: callback,
			error: function(xhr, error, exc) {
				errback(xhr, error, exc, self);
			}
		});
	},
	// returns corresponding instance from raw JSON object (if applicable)
	parse: function(data) {
		return data;
	},
	// list of accepted keys in serialization
	data: [],
	// returns resource's URI
	route: function() {
		return supplant(tiddlyweb.routes[this._type], this);
	}
});

var Container = function(type, name, host) {
	if(arguments.length) { // initialization
		tiddlyweb.Resource.apply(this, [type, host]);
		this.name = name;
		this.desc = "";
		this.policy = null;
	}
};
Container.prototype = new tiddlyweb.Resource();
$.extend(Container.prototype, {
	tiddlers: function() {
		return new TiddlerCollection(this);
	},
	parse: function(data) {
		var type = tiddlyweb._capitalize(this._type);
		var container = new tiddlyweb[type](this.name, this.host);
		data.policy = new tiddlyweb.Policy(data.policy);
		return $.extend(container, data);
	},
	data: ["desc", "policy"]
});

// attribs is an object whose members are merged into the instance (e.g. query)
tiddlyweb.Collection = function(type, host, attribs) {
	if(arguments.length) { // initialization
		tiddlyweb.Resource.apply(this, [type, host]);
		$.extend(this, attribs);
	}
};
tiddlyweb.Collection.prototype = new tiddlyweb.Resource();

var TiddlerCollection = function(container, tiddler) {
	if(arguments.length) { // initialization
		tiddlyweb.Collection.apply(this, [tiddler ? "revisions" : "tiddlers"]);
		this.container = container || null;
		this.tiddler = tiddler || null;
	}
};
TiddlerCollection.prototype = new tiddlyweb.Collection();
$.extend(TiddlerCollection.prototype, {
	parse: function(data) {
		var host = this.container.host;
		return $.map(data, function(item, i) { // TODO: DRY (cf. Tiddler's parse method)
			var tiddler = new tiddlyweb.Tiddler(item.title);
			tiddler.bag = new tiddlyweb.Bag(item.bag, host);
			delete item.bag;
			if(item.recipe) {
				tiddler.recipe = new tiddlyweb.Recipe(item.recipe, host);
				delete item.recipe;
			}
			return $.extend(tiddler, item);
		});
	},
	route: function() {
		if(this.tiddler) {
			var container = this.tiddler.bag || this.tiddler.recipe;
			var params = {
				_type: container._type,
				host: container.host,
				name: container.name,
				title: this.tiddler.title
			};
		} else {
			params = this.container;
		}
		return supplant(tiddlyweb.routes[this._type], params);
	}
});

// title is the name of the tiddler
// container (optional) is an instance of either Bag or Recipe
tiddlyweb.Tiddler = function(title, container) {
	tiddlyweb.Resource.apply(this, ["tiddler", false]);
	this.title = title;
	this.bag = container && container._type == "bag" ? container : null;
	this.recipe = container && container._type == "recipe" ? container : null;
	var self = this;
	$.each(this.data, function(i, item) {
		self[item] = undefined; // exposes list of standard attributes for inspectability
	});
};
tiddlyweb.Tiddler.prototype = new tiddlyweb.Resource();
$.extend(tiddlyweb.Tiddler.prototype, {
	revisions: function() {
		return new TiddlerCollection(this.bag || this.recipe, this);
	},
	route: function() {
		var container = this.bag || this.recipe;
		var params = $.extend({}, this, {
			host: container ? container.host : null,
			_type: this.bag ? "bag" : (this.recipe ? "recipe" : null),
			name: container ? container.name : null
		});
		return supplant(tiddlyweb.routes[this._type], params);
	},
	parse: function(data) {
		var tiddler = new tiddlyweb.Tiddler(this.title);
		var container = this.bag || this.recipe;
		tiddler.bag = new tiddlyweb.Bag(data.bag, container.host);
		delete data.bag;
		if(this.recipe) {
			tiddler.recipe = this.recipe;
		}
		return $.extend(tiddler, data);
	},
	data: ["created", "modified", "modifier", "tags", "fields", "text", "type"]
});

tiddlyweb.Revision = function(id, tiddler) {
	var container = tiddler.bag || tiddler.recipe;
	tiddlyweb.Tiddler.apply(this, [tiddler.title, container]);
	this._type = "revision";
	this.revision = id;
};
tiddlyweb.Revision.prototype = new tiddlyweb.Tiddler();
$.extend(tiddlyweb.Revision.prototype, {
	revisions: false,
	data: false,
	put: false,
	"delete": false
});

tiddlyweb.Bag = function(name, host) {
	Container.apply(this, ["bag", name, host]);
};
tiddlyweb.Bag.prototype = new Container();

tiddlyweb.Recipe = function(name, host) {
	Container.apply(this, ["recipe", name, host]);
	this.recipe = [];
};
tiddlyweb.Recipe.prototype = new Container();
$.extend(tiddlyweb.Recipe.prototype, {
	data: ["recipe"].concat(Container.prototype.data)
});

tiddlyweb.Policy = function(constraints) { // TODO: validation?
	var attr = "read write create delete manage accept owner".split(" ");
	var self = this;
	$.each(attr, function(i, item) {
		self[item] = constraints[item];
	});
};

/*
 * utilities
 */

tiddlyweb._capitalize = function(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

// adapted from Crockford (http://javascript.crockford.com/remedial.html)
var supplant = function(str, obj) {
	return str.replace(/{([^{}]*)}/g, function (a, b) {
		var r = obj[b];
		r = typeof r === "string" || typeof r === "number" ? r : a;
		return b == "host" ? r : encodeURIComponent(r); // XXX: special-casing
	});
};

})(jQuery);
