//Provides a user extension for Chrjs
//
//Requires socialusers plugin from http://github.com/tiddlyweb/tiddlyweb-plugins/tree/master/socialusers
//
//Written by Ben Gillies

(function($) {

    TiddlyWeb.User = function(username, password, host) {
        this.username = username;
        this.password = (password) ? password : '';
        this.host = (host) ? host : '';
    };

    $.extend(TiddlyWeb.User.prototype, {
        getURL: function(username) {
            var usersign = (username) ? '/' + encodeURIComponent(username) : '';
            return this.host + '/users' + usersign;
        },
        create: function(successCallback, errorCallback) {
            var uri = this.getURL();
            var userInfo = $.toJSON({
                username: this.username,
                password: this.password
            });
            
            $.ajax({
                url: uri,
                type: 'POST',
                contentType: 'application/json',
                data: userInfo,
                success: successCallback,
                error: errorCallback
            });
        },
        setPassword: function(password, successCallback, errorCallback) {
            if (password) {
                this.password = password;
            }

            var uri = this.getURL(this.username);
            var userInfo = $.toJSON({
                password: this.password
            });

            $.ajax({
                url: uri,
                type: 'PUT',
                contentType: 'application/json',
                data: userInfo,
                success: successCallback,
                error: errorCallback
            });
        }
    });

})(jQuery);
