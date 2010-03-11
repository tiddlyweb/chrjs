(function($) {

var _response, _status, _xhr, _exc;
var _ajax = jQuery.ajax;

module("transmission", {
	setup: function() {
		jQuery.ajax = function(options) {
			options.success && options.success(options);
			options.error && options.error(options);
			options.complete && options.complete(options);
		};
	},
	teardown: function() {
		jQuery.ajax = _ajax;
	}
});

test("Tiddler", function() {
	var tiddler, bag, _data;

	var callback = function(options) {
		_data = $.evalJSON(options.data);
	};

	_data = null;
	bag = new TiddlyWeb.Bag("Alpha", "http://example.org");
	tiddler = new TiddlyWeb.Tiddler("Foo", bag);
	tiddler.text = "lorem ipsum";
	tiddler.tags = ["foo", "bar", "baz"];
	tiddler.fields = {
		foo: "lorem",
		bar: "ipsum"
	}
	tiddler.nonStandardAttribute = "...";
	tiddler.put(callback);
	var keys = [];
	for(var key in _data) {
		keys.push(key);
	}
	strictEqual(keys.length, 3);
	strictEqual(_data.text, "lorem ipsum");
	strictEqual(_data.tags[1], "bar");
	strictEqual(_data.fields.bar, "ipsum");
	strictEqual(_data.nonStandardAttribute, undefined);
});

test("Bag", function() {
	var bag, _data;

	var callback = function(options) {
		_data = $.evalJSON(options.data);
	};

	_data = null;
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
	bag.put(callback);
	var keys = [];
	for(var key in _data) {
		keys.push(key);
	}
	strictEqual(keys.length, 2);
	strictEqual(_data.desc, "lorem ipsum");
	strictEqual(_data.policy.write[0], "ANY");
	strictEqual(_data.nonStandardAttribute, undefined);
});

test("Recipe", function() {
	var recipe, _data;

	var callback = function(options) {
		_data = $.evalJSON(options.data);
	};

	_data = null;
	recipe = new TiddlyWeb.Recipe("Omega", "http://example.com");
	recipe.desc = "lorem ipsum";
	recipe.policy = {
		"read": [],
		"manage": ["R:ADMIN"],
		"owner": "administrator"
	};
	recipe.recipe = [["foo", ""], ["bar", ""]]
	recipe.nonStandardAttribute = "...";
	recipe.put(callback);
	var keys = [];
	for(var key in _data) {
		keys.push(key);
	}
	strictEqual(keys.length, 3);
	strictEqual(_data.desc, "lorem ipsum");
	strictEqual(_data.policy.manage[0], "R:ADMIN");
	strictEqual(_data.recipe[1][0], "bar");
	strictEqual(_data.nonStandardAttribute, undefined);
});

})(jQuery);
