// chrjs users extension
//
// requires tiddlywebplugins.socialusers
// http://github.com/tiddlyweb/tiddlyweb-plugins/tree/master/socialusers

(function($) {

TiddlyWeb.routes.users = "{host}/users";
TiddlyWeb.routes.user = "{host}/users/{username}";

TiddlyWeb.User = function(username, password, host) {
	TiddlyWeb.Resource.apply(this, ["user", host]);
	this.username = username;
	this.password = password;
};
TiddlyWeb.User.prototype = new TiddlyWeb.Resource();
$.extend(TiddlyWeb.User.prototype, {
	create: function(callback, errback) {
		var uri = this.route().split("/"); // XXX: hacky!?
		uri.pop();
		uri = uri.join("/");
		var data = {
			username: this.username,
			password: this.password
		};
		var self = this;
		$.ajax({
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
		this.put(callback, errback);
	},
	data: ["password"]
});

})(jQuery);
