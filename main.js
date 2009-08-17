/*
 * TiddlyWeb adaptor
 *
 * TODO:
 * * error handling in callbacks
 */

var tiddlyweb = {
	host: "" // defaults to current domain -- XXX: lacks server_prefix -- TODO: document; expects no trailing slash
};

(function($) {

$.extend(tiddlyweb, {
	/*
	 * container has members type ("bag" or "recipe") and name
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	loadTiddlers: function(container, callback) {
		var uri = "/" + container.type + "s/" +
			encodeURIComponent(container.name) + "/tiddlers"
		callback = callback || console.log; // XXX: DEBUG
		this.loadData(uri, callback);
	},

	/*
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	loadTiddler: function(title, container, callback) {
		var uri = "/" + container.type + "s/" +
			encodeURIComponent(container.name) + "/tiddlers/" +
			encodeURIComponent(title)
		callback = callback || console.log; // XXX: DEBUG
		this.loadData(uri, callback);
	},

	/*
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	loadBags: function(callback) {
		var uri = "/bags";
		callback = callback || console.log; // XXX: DEBUG
		this.loadData(uri, callback);
	},

	/*
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	loadBag: function(name, callback) {
		var uri = "/bags/" + encodeURIComponent(name);
		callback = callback || console.log; // XXX: DEBUG
		this.loadData(uri, callback);
	},

	/*
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	loadRecipes: function(callback) {
		var uri = "/recipes";
		callback = callback || console.log; // XXX: DEBUG
		this.loadData(uri, callback);
	},

	/*
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	loadRecipe: function(name, callback) {
		var uri = "/recipes/" + encodeURIComponent(name);
		callback = callback || console.log; // XXX: DEBUG
		this.loadData(uri, callback);
	},

	/*
	 * policy is an object with members write, create, delete, manage and accept,
	 * each an array of users/roles
	 */
	saveBag: function(name, policy) {
		var uri = "/bags/" + encodeURIComponent(name);
		var data = {
			policy: policy
		};
		this.saveData(uri, data, console.log);
	},

	/*
	 * bags is an array of bag names
	 * filters currently unsupported
	 */
	saveRecipe: function(name, bags) {
		var uri = "/recipes/" + encodeURIComponent(name);
		var data = {};
		this.saveData(uri, data, console.log);
	},

	// generic utility methods

	loadData: function(uri, callback) {
		localAjax({
			url: this.host + uri,
			type: "GET",
			dataType: "json",
			success: callback,
			error: callback
		});
	},

	saveData: function(uri, data, callback) {
		localAjax({
			url: this.host + uri,
			type: "PUT",
			dataType: "json",
			data: $.toJSON(data),
			complete: callback
		});
	}
});

/*
 * enable AJAX calls from a local file
 * triggers regular jQuery.ajax call after requesting enhanced privileges
 */
var localAjax = function(args) { // XXX: not required!?
	if(document.location.protocol.indexOf("file") == 0 && window.Components &&
		window.netscape && window.netscape.security) {
		window.netscape.security.PrivilegeManager.
			enablePrivilege("UniversalBrowserRead");
	}
	return jQuery.ajax(args);
};

})(jQuery);
