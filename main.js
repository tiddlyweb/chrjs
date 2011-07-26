// TiddlyWeb adaptor
// v0.11.0
//
// TODO:
// * ensure all routes are supported
// * documentation

/*jslint nomen: false */
/*global jQuery, tiddlyweb */

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
		this._type = type;
		if(host !== false) {
			this.host = host !== undefined ? host.replace(/\/$/, "") : null;
		}
	}
};
$.extend(tiddlyweb.Resource.prototype, {
	// retrieves resource from server
	// callback is passed resource, status, XHR (cf. jQuery.ajax success)
	// errback is passed XHR, error, exception, resource (cf. jQuery.ajax error)
	// filters is an optional filter string (e.g. "select=tag:foo;limit=5")
	get: function(callback, errback, filters) {
		var uri = this.route();
		if(filters) {
			var separator = uri.indexOf("?") === -1 ? "?" : ";";
			uri += separator + filters;
		}
		var self = this;
		return $.ajax({
			url: uri,
			type: "GET",
			dataType: "json",
			success: function(data, status, xhr) {
				var resource = self.parse(data);
				resource.etag = xhr.getResponseHeader("Etag");
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
		var self = this,
			uri = this.route();
		var options = {
			url: uri,
			type: "PUT",
			contentType: "application/json",
			data: this.toJSON(),
			success: function(data, status, xhr) {
				callback(self, status, xhr);
			},
			error: function(xhr, error, exc) {
				errback(xhr, error, exc, self);
			}
		};
		if(this.ajaxSetup) {
			this.ajaxSetup(options);
		}
		return $.ajax(options);
	},
	// deletes resource on server
	// callback is passed data, status, XHR (cf. jQuery.ajax success)
	// errback is passed XHR, error, exception, resource (cf. jQuery.ajax error)
	"delete": function(callback, errback) {
		var self = this,
			uri = this.route();
		var options = {
			url: uri,
			type: "DELETE",
			success: function(data, status, xhr) {
				callback(self, status, xhr);
			},
			error: function(xhr, error, exc) {
				errback(xhr, error, exc, self);
			}
		};
		if(this.ajaxSetup) {
			this.ajaxSetup(options);
		}
		return $.ajax(options);
	},
	// returns the JSON representation of a resource
	toJSON: function() {
		var data = {},
			self = this;
		$.each(this.data, function(i, item) {
			var value = self[item];
			if(value !== undefined) {
				data[item] = value;
			}
		});
		return $.toJSON(data);
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
		this.policy = new tiddlyweb.Policy({});
	}
};
Container.prototype = new tiddlyweb.Resource();
$.extend(Container.prototype, {
	tiddlers: function() {
		return new TiddlerCollection(this);
	},
	parse: function(data) {
		var type = tiddlyweb._capitalize(this._type),
			container = new tiddlyweb[type](this.name, this.host);
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
		var container = this.container;
		return $.map(data, function(item, i) {
			var tiddler = new tiddlyweb.Tiddler(item.title, container),
				bag = item.bag;
			tiddler = tiddlyweb.Tiddler.prototype.parse.apply(tiddler, [item]);
			if(!tiddler.bag && bag) { // XXX: bag always present!?
				tiddler.bag = new tiddlyweb.Bag(bag, container.host);
			}
			if(!tiddler.recipe && item.recipe) {
				tiddler.recipe = new tiddlyweb.Recipe(item.recipe, container.host);
			}
			delete item.recipe;
			return $.extend(tiddler, item);
		});
	},
	route: function() {
		var params = this.container;
		if(this.tiddler) {
			var container = this.tiddler.bag || this.tiddler.recipe;
			params = {
				_type: container._type,
				host: container.host,
				name: container.name,
				title: this.tiddler.title
			};
		}
		return supplant(tiddlyweb.routes[this._type], params);
	}
});

tiddlyweb.Search = function(query, host) {
	tiddlyweb.Collection.apply(this, ["search", host]);
	this.query = query;
};
tiddlyweb.Search.prototype = new tiddlyweb.Collection();
$.extend(tiddlyweb.Search.prototype, {
	parse: function(data) {
		this.container = { // XXX: hacky
			_type: "bag",
			host: this.host
		};
		var tiddlers = TiddlerCollection.prototype.parse.apply(this, arguments);
		delete this.container;
		return tiddlers;
	}
});

// title is the name of the tiddler
// container (optional) is an instance of either Bag or Recipe
// optionally accepts a single object representing tiddler attributes
tiddlyweb.Tiddler = function(title, container) {
	tiddlyweb.Resource.apply(this, ["tiddler", false]);
	this.title = title;
	this.bag = container && container._type === "bag" ? container : null;
	this.recipe = container && container._type === "recipe" ? container : null;
	var self = this;
	$.each(this.data, function(i, item) {
		self[item] = undefined; // exposes list of standard attributes for inspectability
	});
	if(title && title.title) { // title is an object of tiddler attributes
		$.extend(this, title);
	}
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
		var tiddler = new tiddlyweb.Tiddler(this.title),
			container = this.bag || this.recipe;
		tiddler.bag = new tiddlyweb.Bag(data.bag, container.host);
		delete data.bag;
		delete data.recipe;
		tiddler.created = convertTimestamp(data.created);
		delete data.created;
		tiddler.modified = convertTimestamp(data.modified);
		delete data.modified;
		if(this.recipe) {
			tiddler.recipe = this.recipe;
		}
		return $.extend(tiddler, data);
	},
	data: ["modifier", "tags", "fields", "text", "type"],
	ajaxSetup: function(options) {
		var self = this;
		if(this.etag && (options.type === "PUT" || options.type === "DELETE")) {
			options.beforeSend = function(xhr) {
				xhr.setRequestHeader("If-Match", self.etag);
			};
		}
		if(options.type === "PUT") {
			var callback = options.success;
			options.success = function(data, status, xhr) {
				var loc = xhr.getResponseHeader("Location"),
					etag = xhr.getResponseHeader("Etag");
				if(loc && etag) {
					self.etag = etag;
					if(!self.bag) {
						var bag = loc.split("/bags/").pop().split("/")[0];
						self.bag = new tiddlyweb.Bag(bag, self.recipe.host);
					}
					callback(self, status, xhr);
				} else { // IE
					self.get(callback, options.error);
				}
			};
		}
	}
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
	var self = this;
	$.each(this.constraints, function(i, item) {
		self[item] = constraints[item];
	});
};
tiddlyweb.Policy.prototype.constraints = ["read", "write", "create", "delete",
	"manage", "accept", "owner"];

/*
 * utilities
 */

tiddlyweb._capitalize = function(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

// convert YYYYMMDDhhmmss timestamp to Date instance
var convertTimestamp = function(t) {
	return new Date(Date.UTC(
		parseInt(t.substr(0, 4), 10),
		parseInt(t.substr(4, 2), 10) - 1,
		parseInt(t.substr(6, 2), 10),
		parseInt(t.substr(8, 2), 10),
		parseInt(t.substr(10, 2), 10),
		parseInt(t.substr(12, 2) || "0", 10),
		parseInt(t.substr(14, 3) || "0", 10)
	));
};

// adapted from Crockford (http://javascript.crockford.com/remedial.html)
var supplant = function(str, obj) {
	return str.replace(/{([^{}]*)}/g, function (a, b) {
		var r = obj[b];
		r = typeof r === "string" || typeof r === "number" ? r : a;
		return $.inArray(b, ["host", "query"]) !== -1 ? r : encodeURIComponent(r); // XXX: special-casing
	});
};

}(jQuery));
