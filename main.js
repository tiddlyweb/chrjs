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
	routes: { // placeholders "type" and "name" refer to container (bag/recipe)
		root      : "{prefix}/",
		containers: "{prefix}/{type}",
		container : "{prefix}/{type}/{name}",
		tiddlers  : "{prefix}/{type}s/{name}/tiddlers",
		tiddler   : "{prefix}/{type}s/{name}/tiddlers/{title}",
		revisions : "{prefix}/{type}s/{name}/tiddlers/{title}/revisions",
		revision  : "{prefix}/{type}s/{name}/tiddlers/{title}/revisions/{id}",
		search    : "{prefix}/search?q={query}"
	}
};

var Resource = function() {}; // XXX: should not be private?
$.extend(Resource.prototype. {
	get: function() {
		localAjax({
			url: this.route() + uri,
			type: "GET",
			dataType: "json",
			success: callback,
			error: callback
		});
	}
});

/*
 * Tiddler
 */

TiddlyWeb.Tiddler = function(title) {
	this.title = title;
};
TiddlyWeb.Tiddler.prototype = Resource;

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
