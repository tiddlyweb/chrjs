//Provides a user extension for Chrjs
//
//Requires socialusers plugin from http://github.com/tiddlyweb/tiddlyweb-plugins/tree/master/socialusers
//
//Written by Ben Gillies

(function($) {

    TiddlyWeb.routes.user = '{host}/{_type}s/{usersign}';

    TiddlyWeb.User = function(usersign, host) {
        TiddlyWeb.Resource.apply(this, ['user', host]);
        this.usersign = usersign;
    };
    TiddlyWeb.User.prototype = new TiddlyWeb.Resource();
    $.extend(TiddlyWeb.User.prototype, {
        data: ['password']
    });

})(jQuery);
