// chrjs users extension
//
// requires tiddlywebplugins.socialusers
// http://pypi.python.org/pypi/tiddlywebplugins.socialusers

(function($) {

tiddlyweb.routes.users = "{host}/users";
tiddlyweb.routes.user = "{host}/users/{username}";

tiddlyweb.User = function(username, password, host) {
	tiddlyweb.Resource.apply(this, ["user", host]);
	this.username = username;
	this.password = password;
};
tiddlyweb.User.prototype = new tiddlyweb.Resource();
$.extend(tiddlyweb.User.prototype, {
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
			data: $.toJSON(data),
			success: callback,
			error: function(xhr, error, exc) {
				errback(xhr, error, exc, self);
			}
		});
	},
	setPassword: function(password, callback, errback) {
		this.password = password;
		return this.put(callback, errback);
	},
	data: ["password"]
});

})(jQuery);
