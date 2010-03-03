// TiddlyWeb adaptor
// v0.5.0
//
// TODO:
// * remove localAjax (higher-level applications' responsibility)
// * ensure all routes are supported
// * PUT support (in separate file?)
// * move classes' initialization to separate init method (=> no need for .apply?)
// * create wrapper function for inheritance
// * login/challenge support? (delegate to user errback?)
// * documentation

(function($) {

TiddlyWeb = {
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
		revision : "{host}/{_type}s/{name}/tiddlers/{title}/revisions/{id}",
		search   : "{host}/search?q={query}"
	}
};

// host (optional) is the URI of the originating TiddlyWeb instance
var Resource = function(type, host) {
	if(arguments.length) { // initialization
		this._type = type; // XXX: somewhat redundant, as it generally corresponds to class name
		if(host !== false) {
			this.host = host !== undefined ? host.replace(/\/$/, "") : null;
		}
	}
};
$.extend(Resource.prototype, {
	// retrieves resource from server
	// callback is passed data, status, XHR (cf. jQuery.ajax success)
	// errback is passed XHR, error, exception (cf. jQuery.ajax error)
	// filters is a filter string (e.g. "select=tag:foo;limit=5")
	get: function(callback, errback, filters) {
		var uri = this.route();
		if(filters) {
			var separator = uri.indexOf("?") == -1 ? "?" : ";";
			uri += separator + filters;
		}
		var self = this;
		localAjax({
			url: uri,
			type: "GET",
			dataType: "json",
			success: function(data, status, xhr) {
				var resource = self.parse(data);
				callback(resource, status, xhr);
			},
			error: errback
		});
	},
	// returns corresponding instance from raw JSON object (if applicable)
	parse: function(data) {
		return data;
	},
	route: function() {
		return supplant(TiddlyWeb.routes[this._type], this);
	}
});

var Container = function(type, name, host) {
	if(arguments.length) { // initialization
		Resource.apply(this, [type, host]);
		this.name = name;
		this.tiddlers = new TiddlerCollection(this);
	}
};
Container.prototype = new Resource();
$.extend(Container.prototype, {
	parse: function(data) {
		var type = this._type.charAt(0).toUpperCase() + this._type.slice(1);
		var container = new TiddlyWeb[type](this.name, this.host);
		return $.extend(container, data);
	}
});

// attribs is an object whose members are merged into the instance (e.g. query)
TiddlyWeb.Collection = function(type, host, attribs) {
	if(arguments.length) { // initialization
		Resource.apply(this, [type, host]);
		$.extend(this, attribs);
	}
};
TiddlyWeb.Collection.prototype = new Resource();

var TiddlerCollection = function(container, tiddler) {
	if(arguments.length) { // initialization
		TiddlyWeb.Collection.apply(this, [tiddler ? "revisions" : "tiddlers"]);
		this.container = container || null;
		this.tiddler = tiddler || null;
	}
};
TiddlerCollection.prototype = new TiddlyWeb.Collection();
$.extend(TiddlerCollection.prototype, {
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
		return supplant(TiddlyWeb.routes[this._type], params);
	}
});

// title is the name of the tiddler
// container (optional) is an instance of either Bag or Recipe
TiddlyWeb.Tiddler = function(title, container) {
	Resource.apply(this, ["tiddler", false]);
	this.title = title;
	this.bag = container && container._type == "bag" ? container.name : null;
	this.recipe = container && container._type == "recipe" ? container.name : null;
	this.revisions = new TiddlerCollection(container, this);
};
TiddlyWeb.Tiddler.prototype = new Resource();
$.extend(TiddlyWeb.Tiddler.prototype, {
	route: function() {
		var container = this.bag || this.recipe;
		var params = $.extend({}, this, {
			host: container ? container.host : null,
			_type: this.bag ? "bag" : (this.recipe ? "recipe" : null),
			name: container ? container.name : null
		});
		return supplant(TiddlyWeb.routes[this._type], params);
	},
	parse: function(data) {
		var tiddler = new TiddlyWeb.Tiddler(this.title);
		var container = this.bag || this.recipe;
		tiddler.bag = new TiddlyWeb.Bag(data.bag, container.host);
		delete data.bag;
		return $.extend(tiddler, data);
	}
});

TiddlyWeb.Bag = function(name, host) {
	Container.apply(this, ["bag", name, host]);
};
TiddlyWeb.Bag.prototype = new Container();

TiddlyWeb.Recipe = function(name, host) {
	Container.apply(this, ["recipe", name, host]);
};
TiddlyWeb.Recipe.prototype = new Container();

/*
 * utilities
 */

// adapted from Crockford (http://javascript.crockford.com/remedial.html)
var supplant = function(str, obj) {
	return str.replace(/{([^{}]*)}/g, function (a, b) { return obj[b] || a; });
};

// enables AJAX calls from a local file
// triggers regular jQuery.ajax call after requesting enhanced privileges
var localAjax = function(args) {
	if(document.location.protocol.indexOf("file") == 0 && window.Components &&
		window.netscape && window.netscape.security) {
		window.netscape.security.PrivilegeManager.
			enablePrivilege("UniversalBrowserRead");
	}
	return jQuery.ajax(args);
};

})(jQuery);
