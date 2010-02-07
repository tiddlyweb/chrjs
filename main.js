// TiddlyWeb adaptor
// v0.5.0
//
// TODO:
// * error handling in callbacks
// * use Crockford's Prototypal Inheritance to avoid "new" operator
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

// host (optional) is the URI of the originating TiddlyWeb instance
var Resource = function(type, host) {
	if(arguments.length) { // initialization
		this.type = type; // XXX: somewhat redundant, as it generally corresponds to class name
		this.host = host !== undefined ? host.replace(/\/$/, "") : null;
		if(this.host && this.host.indexOf("://") == -1) {
			this.host = "http://" + this.host; // XXX: evil magic?
		}
	}
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
		}); // TODO: route callbacks through onSuccess/onError methods to return corresponding instance?
	},
	route: function() {
		return supplant(TiddlyWeb.routes[this.type], this);
	}
});

var Container = function(type, name, host) {
	if(arguments.length) { // initialization
		Resource.apply(this, [type, host]);
		this.name = name;
		this.tiddlers = new Collection(this);
	}
};
Container.prototype = new Resource();

var Collection = function(container) { // XXX: currently only works for tiddler collections, not for bag/recipe collections (due to type attribute)
	if(arguments.length) { // initialization
		Resource.apply(this, [container.type, host]);
		this.name = container.name;
	}
};
Collection.prototype = new Resource();
$.extend(Collection.prototype, {
	route: function() {
		return supplant(TiddlyWeb.routes.tiddlers, this);
	}
});

/*
 * Tiddler
 */

// title is the name of the tiddler
// container (optional) is an instance of either Bag or Recipe
TiddlyWeb.Tiddler = function(title, host, container) {
	Resource.apply(this, ["tiddler", host]); // XXX: "type" attribute ambiguous (class name vs. content type)
	this.title = title;
	this.bag = container && container.type == "bag" ? container.name : null;
	this.recipe = container && container.type == "recipe" ? container.name : null;
};
TiddlyWeb.Tiddler.prototype = new Resource();
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

TiddlyWeb.Bag = function(name, host) {
	Container.apply(this, ["bag", name, host]);
};
TiddlyWeb.Bag.prototype = new Container();

/*
 * Recipe
 */

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
var localAjax = function(args) { // XXX: for debugging purposes only!?
	if(document.location.protocol.indexOf("file") == 0 && window.Components &&
		window.netscape && window.netscape.security) {
		window.netscape.security.PrivilegeManager.
			enablePrivilege("UniversalBrowserRead");
	}
	return jQuery.ajax(args);
};

})(jQuery);
