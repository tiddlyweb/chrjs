(function($) {

var _response, _status, _xhr, _exc;
var _ajax = jQuery.ajax;

module("retrieval", {
	setup: function() {
		jQuery.ajax = function(options) {
			options.success && options.success(_response, _status, _xhr);
			options.error && options.error(_xhr, _error, _exc);
			options.complete && options.complete(_response, _status, _xhr);
		};
	},
	teardown: function() {
		jQuery.ajax = _ajax;
	}
});

test("Tiddler", function() {
	var tiddler, _tiddler;
	var host = "localhost";
	var callback = function(tiddler, status, xhr) {
		_tiddler = tiddler;
	};

	_tiddler = null;
	_response = {
		bag: "Alpha"
	};
	tiddler = new TiddlyWeb.Tiddler("Foo");
	tiddler.bag = new TiddlyWeb.Bag("Alpha", host);
	tiddler.get(callback);
	strictEqual(_tiddler._type, "tiddler");
	strictEqual(_tiddler.title, "Foo");
	strictEqual(_tiddler.bag._type, "bag");
	strictEqual(_tiddler.bag.name, "Alpha");
	strictEqual(_tiddler.bag.host, "localhost");

	_tiddler = null;
	_response = {
		bag: "Bravo"
	};
	tiddler = new TiddlyWeb.Tiddler("Bar");
	tiddler.recipe = new TiddlyWeb.Recipe("Omega", host);
	tiddler.get(callback);
	strictEqual(_tiddler._type, "tiddler");
	strictEqual(_tiddler.title, "Bar");
	strictEqual(_tiddler.bag._type, "bag");
	strictEqual(_tiddler.bag.name, "Bravo");
	strictEqual(_tiddler.bag.host, "localhost");
	strictEqual(_tiddler.recipe._type, "recipe");
	strictEqual(_tiddler.recipe.name, "Omega");
	strictEqual(_tiddler.recipe.host, "localhost");
});

test("Bag", function() {
	var bag, _bag;
	var host = "localhost";
	var callback = function(bag, status, xhr) {
		_bag = bag;
	};

	_bag = null;
	_response = {
		desc: "lorem ipsum",
		policy: {
			"read": [],
			"write": ["ANY"],
			"create": ["ANY"],
			"delete": ["R:ADMIN"],
			"manage": ["R:ADMIN"],
			"accept": ["R:ADMIN"],
			"owner": "administrator"
		}
	};
	bag = new TiddlyWeb.Bag("Alpha", host);
	bag.get(callback);
	strictEqual(_bag._type, "bag");
	strictEqual(_bag.name, "Alpha");
	strictEqual(_bag.host, "localhost");
	strictEqual(_bag.desc, "lorem ipsum");
	strictEqual(_bag.policy.read.length, 0);
	strictEqual(_bag.policy.accept.length, 1);
	strictEqual(_bag.policy.accept[0], "R:ADMIN");
	strictEqual(_bag.policy.owner, "administrator");
});

test("Recipe", function() {
	var recipe, _recipe;
	var host = "localhost";
	var callback = function(recipe, status, xhr) {
		_recipe = recipe;
	};

	_recipe = null;
	_response = {
		desc: "lorem ipsum",
		policy: {
			"read": [],
			"manage": ["R:ADMIN"],
			"owner": "administrator"
		},
		recipe: [["foo", ""], ["bar", ""]]
	};
	recipe = new TiddlyWeb.Recipe("Omega", host);
	recipe.get(callback);
	strictEqual(_recipe._type, "recipe");
	strictEqual(_recipe.name, "Omega");
	strictEqual(_recipe.host, "localhost");
	strictEqual(_recipe.desc, "lorem ipsum");
	strictEqual(_recipe.policy.read.length, 0);
	strictEqual(_recipe.policy.manage.length, 1);
	strictEqual(_recipe.policy.manage[0], "R:ADMIN");
	strictEqual(_recipe.policy.owner, "administrator");
	strictEqual(_recipe.recipe.length, 2);
	strictEqual(_recipe.recipe[0].length, 2);
	strictEqual(_recipe.recipe[1][0], "bar");
});

test("Collection: Bags", function() {
	// TODO
});

test("Collection: Recipes", function() {
	// TODO
});

test("Collection: Bag Tiddlers", function() {
	// TODO
});

test("Collection: Recipe Tiddlers", function() {
	// TODO
});

test("Collection: Tiddler Revisions", function() {
	// TODO
});

})(jQuery);
