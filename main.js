/*
 * TiddlyWeb adaptor
 * v0.5.0
 *
 * TODO:
 * * error handling in callbacks
 * * use Crockford's Prototypal Inheritance to avoid "new" operator
 * * remove localAjax (higher-level applications' responsibility)
 * * search support
 */

(function($) {

TiddlyWeb = {
	routes: { // placeholders "type" & "name" refer to the respective bag/recipe
		root     : "{prefix}/",
		bags     : "{prefix}/bags",
		bag      : "{prefix}/bags/{name}",
		recipes  : "{prefix}/recipes",
		recipe   : "{prefix}/recipes/{name}",
		tiddlers : "{prefix}/{type}s/{name}/tiddlers",
		tiddler  : "{prefix}/{type}s/{name}/tiddlers/{title}",
		revisions: "{prefix}/{type}s/{name}/tiddlers/{title}/revisions",
		revision : "{prefix}/{type}s/{name}/tiddlers/{title}/revisions/{id}",
		search   : "{prefix}/search?q={query}"
	} // XXX: s/prefix/host/ (includes server_prefix)?
};

var Resource = function() {}; // XXX: should not be private?
$.extend(Resource.prototype, {
	get: function() {
		localAjax({
			url: this.route(),
			type: "GET",
			dataType: "json",
			success: this.processData,
			error: this.handleError
		});
	},
	processData: function(data, status, xhr) {},
	handleError: function(xhr, error, exc) {},
	route: function() {
		return supplant(TiddlyWeb.routes[this.type], this);
	}
});

var Container = function(type) { // XXX: excessive abstraction!?
	this.type = type;
};
Container.prototype = new Resource();
$.extend(Container.prototype, {
	listTiddlers: function() {
		// XXX: hacky!?
		var _container = function() {};
		_container.type = this.type + "s";
		_container.get(); // TODO: adjusted callbacks
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
 * Tiddler
 */

TiddlyWeb.Tiddler = function(title) {
	this.title = title;
};
TiddlyWeb.Tiddler.prototype = new Resource();

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
