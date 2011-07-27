// chrjs users extension
// v0.5.0
//
// requires tiddlywebplugins.socialusers
// http://pypi.python.org/pypi/tiddlywebplugins.socialusers

/*jslint vars: true */
/*global jQuery, tiddlyweb */

(function($, tw) {

"use strict";

tw.routes.users = "{host}/users";
tw.routes.user = "{host}/users/{username}";

tw.User = function(username, password, host) {
	tw.Resource.apply(this, ["user", host]);
	this.username = username;
	this.password = password;
};
tw.User.prototype = new tw.Resource();
$.extend(tw.User.prototype, {
	create: function(callback, errback) {
		var uri = this.route().split("/"); // XXX: hacky!?
		uri.pop();
		uri = uri.join("/");
		var data = {
			username: this.username,
			password: this.password
		};
		var self = this;
		return $.ajax({
			url: uri,
			type: "POST",
			contentType: "application/json",
			data: JSON.stringify(data),
			success: callback,
			error: function(xhr, error, exc) {
				errback(xhr, error, exc, self);
			}
		});
	},
	setPassword: function(newPass, callback, errback) {
		this.old_password = this.password; // XXX: should not use underscore (consistency)
		this.password = newPass;
		return this.put(callback, errback);
	},
	data: ["password", "old_password"]
});

}(jQuery, tiddlyweb));
