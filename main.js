/*
 * TiddlyWeb adaptor
 * v0.5.0
 *
 * TODO:
 * * error handling in callbacks
 * * use Crockford's Prototypal Inheritance to avoid "new" operator
 * * remove localAjax (higher-level applications' responsibility)
 * * ensure all routes are supported
 * * PUT support (in separate file?)
 */

(function($) {

TiddlyWeb = {
	routes: {
		// host is URL of TiddlyWeb instance (including server_prefix)
		// placeholders "type" & "name" refer to the respective bag/recipe
		root     : "{host}/",
		bags     : "{host}/bags",
		bag      : "{host}/bags/{name}",
		recipes  : "{host}/recipes",
		recipe   : "{host}/recipes/{name}",
		tiddlers : "{host}/{type}s/{name}/tiddlers",
		tiddler  : "{host}/{type}s/{name}/tiddlers/{title}",
		revisions: "{host}/{type}s/{name}/tiddlers/{title}/revisions",
		revision : "{host}/{type}s/{name}/tiddlers/{title}/revisions/{id}",
		search   : "{host}/search?q={query}"
	}
};

var Resource = function(type) {
	this.type = type;
};
$.extend(Resource.prototype, {
	// retrieves tiddler from server
	// callback arguments are as defined by jQuery.ajax:
	// data, status, xhr (success) and  xhr, error, exc (error)
	get: function(callback, errback) {
		localAjax({
			url: this.route(),
			type: "GET",
			dataType: "json",
			success: callback,
			error: errback
		});
	},
	route: function() {
		return supplant(TiddlyWeb.routes[this.type], this);
	}
});

var Container = function(type) {
	this.type = type; // XXX: redundant (cf. Resource)
};
Container.prototype = new Resource();
$.extend(Container.prototype, {
	listTiddlers: function() { // XXX: should be collection object with its own get method
		// XXX: hacky!?
		var collection = new Container(this.type); // XXX: not a container!?
		collection.container = this; // XXX: unused
		collection.route = function() {
			return supplant(TiddlyWeb.routes[this.type + "s"], this);
		};
		collection.get(); // TODO: adjusted callbacks
	}
});

/*
 * Tiddler
 */

// title is the name of the tiddler
// container (optional) is an instance of either Bag or Recipe
// host (optional) is the URI of the originating TiddlyWeb instance
TiddlyWeb.Tiddler = function(title, container, host) {
	this.title = title;
	this.bag = container && container.type == "bag" ? container.name : null;
	this.recipe = container && container.type == "recipe" ? container.name : null;
	this.host = host !== undefined ? host : null; // TODO: should be part of Resource -- TODO: optionally add protocol, strip trailing slash
};
TiddlyWeb.Tiddler.prototype = new Resource("tiddler");
$.extend(TiddlyWeb.Tiddler.prototype, {
	route: function() {
		var params = $.extend({}, this, {
			type: this.bag ? "bag" : (this.recipe ? "recipe" : null),
			name: this.bag || this.recipe
		});
		return supplant(TiddlyWeb.routes[this.type], params);
	}
});

/*
 * Bag
 */

TiddlyWeb.Bag = function(name) {
	this.name = name;
};
TiddlyWeb.Bag.prototype = new Container("bag");

/*
 * Recipe
 */

TiddlyWeb.Recipe = function(name) {
	this.name = name;
};
TiddlyWeb.Recipe.prototype = new Container("recipe");

/*
 * utilities
 */

// adapted from Crockford (http://javascript.crockford.com/remedial.html)
var supplant = function(str, obj) {
	return str.replace(/{([^{}]*)}/g, function (a, b) { return obj[b] || a; });
};

// enables AJAX calls from a local file
// triggers regular jQuery.ajax call after requesting enhanced privileges
var localAjax = function(args) { // XXX: for debugging purposes only!?
	if(document.location.protocol.indexOf("file") == 0 && window.Components &&
		window.netscape && window.netscape.security) {
		window.netscape.security.PrivilegeManager.
			enablePrivilege("UniversalBrowserRead");
	}
	return jQuery.ajax(args);
};

})(jQuery);
