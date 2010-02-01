/*
 * TiddlyWeb adaptor
 * v0.3.0
 *
 * TODO:
 * * error handling in callbacks
 * * use Crockford's Prototypal Inheritance to avoid "new" operator
 */

// constructor
// host defaults to the current domain (without server_prefix)
function TiddlyWeb(host) {
	this.host = host ? host.replace(/\/$/, "") : "";
}

$.extend(TiddlyWeb, {
	Bag: function(name) {
		this.type = "bag"; // XXX: redundant!?
		this.name = name;
	},
	Recipe: function(name) {
		this.type = "recipe"; // XXX: redundant!?
		this.name = name;
	}
});

(function($) {

$.extend(TiddlyWeb.prototype, {
	/*
	 * container is an instance of either Bag or Recipe
	 * container.filter is an optional filter string ("select=tag:foo;limit=5")
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	listTiddlers: function(container, callback) {
		var uri = "/" + container.type + "s/" +
			encodeURIComponent(container.name) + "/tiddlers" +
			(container.filter ? "?" + encodeURIComponent(container.filter) : "");
		this.loadData(uri, callback);
	},

	/*
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	getTiddler: function(title, container, callback) {
		var uri = "/" + container.type + "s/" +
			encodeURIComponent(container.name) + "/tiddlers/" +
			encodeURIComponent(title);
		this.loadData(uri, callback);
	},

	/*
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	loadBags: function(callback) {
		var uri = "/bags";
		this.loadData(uri, callback);
	},

	/*
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	loadBag: function(name, callback) {
		var uri = "/bags/" + encodeURIComponent(name);
		this.loadData(uri, callback);
	},

	/*
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	loadRecipes: function(callback) {
		var uri = "/recipes";
		this.loadData(uri, callback);
	},

	/*
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	loadRecipe: function(name, callback) {
		var uri = "/recipes/" + encodeURIComponent(name);
		this.loadData(uri, callback);
	},

	/*
	 * policy is an object with members write, create, delete, manage and accept,
	 * each an array of users/roles
	 */
	saveBag: function(name, policy, callback) {
		var uri = "/bags/" + encodeURIComponent(name);
		var data = {
			policy: policy
		};
		this.saveData(uri, data, callback);
	},

	/*
	 * recipe is an object with members desc, policy and recipe
	 * recipe.recipe is an array of bag-filter string pairs
	 */
	saveRecipe: function(name, recipe, callback) {
		var uri = "/recipes/" + encodeURIComponent(name);
		this.saveData(uri, recipe, callback);
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
			contentType: "application/json",
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
