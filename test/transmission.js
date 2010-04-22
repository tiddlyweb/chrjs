(function($) {

var _response, _status, _xhr, _error, _exc;
var _ajax = jQuery.ajax;

module("transmission", {
	setup: function() {
		jQuery.ajax = function(options) {
			var resource = $.evalJSON(options.data);
			options.success && options.success(resource, _status, _xhr);
			options.error && options.error(_xhr, _error, _exc);
			options.complete && options.complete(resource, _status, _xhr);
		};
	},
	teardown: function() {
		jQuery.ajax = _ajax;
	}
});

test("Tiddler", function() {
	var tiddler, bag, _data, _tiddler_orig;

	var callback = function(tiddler, status, xhr) {
		_data = tiddler;
	};
	var errback = function(xhr, error, exc, tiddler) {
		_tiddler_orig = tiddler;
	};

	_data = null;
	_tiddler_orig = null;
	bag = new TiddlyWeb.Bag("Alpha", "http://example.org");
	tiddler = new TiddlyWeb.Tiddler("Foo", bag);
	tiddler.text = "lorem ipsum";
	tiddler.tags = ["foo", "bar", "baz"];
	tiddler.fields = {
		foo: "lorem",
		bar: "ipsum"
	}
	tiddler.nonStandardAttribute = "...";
	tiddler.put(callback, errback);
	var keys = [];
	for(var key in _data) {
		keys.push(key);
	}
	strictEqual(keys.length, 3);
	strictEqual(_data.text, "lorem ipsum");
	strictEqual(_data.tags[1], "bar");
	strictEqual(_data.fields.bar, "ipsum");
	strictEqual(_data.nonStandardAttribute, undefined);
	strictEqual(_tiddler_orig, tiddler);
});

test("Bag", function() {
	var bag, _data, _bag_orig;

	var callback = function(bag, status, xhr) {
		_data = bag;
	};
	var errback = function(xhr, error, exc, bag) {
		_bag_orig = bag;
	};

	_data = null;
	_bag_orig = null;
	bag = new TiddlyWeb.Bag("Alpha", "http://example.org");
	bag.desc = "lorem ipsum";
	bag.policy = {
		"read": [],
		"write": ["ANY"],
		"create": ["ANY"],
		"delete": ["R:ADMIN"],
		"manage": ["R:ADMIN"],
		"accept": ["R:ADMIN"],
		"owner": "administrator"
	};
	bag.nonStandardAttribute = "...";
	bag.put(callback, errback);
	var keys = [];
	for(var key in _data) {
		keys.push(key);
	}
	strictEqual(keys.length, 2);
	strictEqual(_data.desc, "lorem ipsum");
	strictEqual(_data.policy.write[0], "ANY");
	strictEqual(_data.nonStandardAttribute, undefined);
	strictEqual(_bag_orig, bag);
});

test("Recipe", function() {
	var recipe, _data, _recipe_orig;

	var callback = function(recipe, status, xhr) {
		_data = recipe;
	};
	var errback = function(xhr, error, exc, recipe) {
		_recipe_orig = recipe;
	};

	_data = null;
	_recipe_orig = null;
	recipe = new TiddlyWeb.Recipe("Omega", "http://example.com");
	recipe.desc = "lorem ipsum";
	recipe.policy = {
		"read": [],
		"manage": ["R:ADMIN"],
		"owner": "administrator"
	};
	recipe.recipe = [["foo", ""], ["bar", ""]]
	recipe.nonStandardAttribute = "...";
	recipe.put(callback, errback);
	var keys = [];
	for(var key in _data) {
		keys.push(key);
	}
	strictEqual(keys.length, 3);
	strictEqual(_data.desc, "lorem ipsum");
	strictEqual(_data.policy.manage[0], "R:ADMIN");
	strictEqual(_data.recipe[1][0], "bar");
	strictEqual(_data.nonStandardAttribute, undefined);
	strictEqual(_recipe_orig, recipe);
});

})(jQuery);
