(function($) {

var _response, _status, _xhr, _error, _exc, _ajaxParams;
var _ajax = $.ajax;

var XHR = function(headers) {
	this._headers = headers || {};
};
XHR.prototype.getResponseHeader = function(name) {
	return this._headers[name.toLowerCase()];
};
XHR.prototype.setRequestHeader = function(name, value) {
	this._headers[name.toLowerCase()] = value;
};

module("transmission", {
	setup: function() {
		_xhr = new XHR();
		$.ajax = function(options) {
			_ajaxParams = options;
			options.beforeSend && options.beforeSend(_xhr);
			var resource = options.data ? $.evalJSON(options.data) : null;
			options.success && options.success(resource, _status, _xhr);
			options.error && options.error(_xhr, _error, _exc);
			options.complete && options.complete(resource, _status, _xhr);
		};
	},
	teardown: function() {
		$.ajax = _ajax;
	}
});

test("Tiddler", function() {
	var tiddler, bag, _data, _tiddler_orig;
	_xhr._headers.etag = '"..."';

	var callback = function(tiddler, status, xhr) {
		_data = tiddler;
	};
	var errback = function(xhr, error, exc, tiddler) {
		_tiddler_orig = tiddler;
	};

	_data = null;
	_tiddler_orig = null;
	bag = new tiddlyweb.Bag("Alpha", "http://example.org");
	tiddler = new tiddlyweb.Tiddler("Foo", bag);
	tiddler.text = "lorem ipsum";
	tiddler.tags = ["foo", "bar", "baz"];
	tiddler.fields = {
		foo: "lorem",
		bar: "ipsum"
	}
	tiddler.nonStandardAttribute = "...";
	tiddler.put(callback, errback);

	var payload = $.evalJSON(_ajaxParams.data);
	var attribs = [];
	for(var key in payload) {
		attribs.push(key);
	}
	strictEqual(attribs.length, 3);
	strictEqual(payload.nonStandardAttribute, undefined);
	strictEqual(_data instanceof tiddlyweb.Tiddler, true);
	strictEqual(_data.text, "lorem ipsum");
	strictEqual(_data.tags[1], "bar");
	strictEqual(_data.fields.bar, "ipsum");
	strictEqual(_tiddler_orig, tiddler);
});

test("Bag", function() {
	var bag, _data, _bag_orig;
	_xhr._headers.etag = '"..."';

	var callback = function(bag, status, xhr) {
		_data = bag;
	};
	var errback = function(xhr, error, exc, bag) {
		_bag_orig = bag;
	};

	_data = null;
	_bag_orig = null;
	bag = new tiddlyweb.Bag("Alpha", "http://example.org");
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
	var payload = $.evalJSON(_ajaxParams.data);
	var attribs = [];
	for(var key in payload) {
		attribs.push(key);
	}
	strictEqual(attribs.length, 2);
	strictEqual(payload.nonStandardAttribute, undefined);
	strictEqual(_data instanceof tiddlyweb.Bag, true);
	strictEqual(_data.desc, "lorem ipsum");
	strictEqual(_data.policy.write[0], "ANY");
	strictEqual(_bag_orig, bag);
});

test("Recipe", function() {
	var recipe, _data, _recipe_orig;
	_xhr._headers.etag = '"..."';

	var callback = function(recipe, status, xhr) {
		_data = recipe;
	};
	var errback = function(xhr, error, exc, recipe) {
		_recipe_orig = recipe;
	};

	_data = null;
	_recipe_orig = null;
	recipe = new tiddlyweb.Recipe("Omega", "http://example.com");
	recipe.desc = "lorem ipsum";
	recipe.policy = {
		"read": [],
		"manage": ["R:ADMIN"],
		"owner": "administrator"
	};
	recipe.recipe = [["foo", ""], ["bar", ""]]
	recipe.nonStandardAttribute = "...";
	recipe.put(callback, errback);
	var payload = $.evalJSON(_ajaxParams.data);
	var attribs = [];
	for(var key in payload) {
		attribs.push(key);
	}
	strictEqual(attribs.length, 3);
	strictEqual(payload.nonStandardAttribute, undefined);
	strictEqual(_data instanceof tiddlyweb.Recipe, true);
	strictEqual(_data.desc, "lorem ipsum");
	strictEqual(_data.policy.manage[0], "R:ADMIN");
	strictEqual(_data.recipe[1][0], "bar");
	strictEqual(_recipe_orig, recipe);
});

test("ETag", function() {
	var tiddler, bag, _data;
	_xhr._headers.etag = '"..."';

	var callback = function(tiddler, status, xhr) {
		_data = tiddler;
	};
	var errback = function(xhr, error, exc, tiddler) {};

	_data = null;
	bag = new tiddlyweb.Bag("Alpha", "http://example.org");

	tiddler = new tiddlyweb.Tiddler("Foo", bag);
	tiddler.put(callback, errback);
	strictEqual($.isFunction(_ajaxParams.beforeSend), false);
	strictEqual(_xhr._headers["if-match"], undefined);
	strictEqual(_data instanceof tiddlyweb.Tiddler, true);
	strictEqual(_data.etag, '"..."');

	delete _xhr._headers["if-match"];
	tiddler = new tiddlyweb.Tiddler("Bar", bag);
	tiddler.etag = '"~~~"';
	tiddler.put(callback, errback);
	strictEqual($.isFunction(_ajaxParams.beforeSend), true);
	strictEqual(_xhr._headers["if-match"], '"~~~"');

	delete _xhr._headers["if-match"];
	tiddler = new tiddlyweb.Tiddler("Baz", bag);
	tiddler.put(callback, errback);
	strictEqual($.isFunction(_ajaxParams.beforeSend), false);
	strictEqual(_xhr._headers["if-match"], undefined);

	delete _xhr._headers["if-match"];
	tiddler = new tiddlyweb.Tiddler("Baz", bag);
	tiddler.etag = '"###"';
	tiddler["delete"](callback, errback);
	strictEqual($.isFunction(_ajaxParams.beforeSend), true);
	strictEqual(_xhr._headers["if-match"], '"###"');

	delete _xhr._headers["if-match"];
	tiddler = new tiddlyweb.Tiddler("Baz", bag);
	tiddler["delete"](callback, errback);
	strictEqual($.isFunction(_ajaxParams.beforeSend), false);
	strictEqual(_xhr._headers["if-match"], undefined);
});

test("Missing ETag (IE)", function() {
	var tiddler, bag, recipe, _data;

	var callback = function(entity, status, xhr) {
		_data = entity;
	};
	var errback = function(xhr, error, exc, tiddler) {};

	_data = null;
	bag = new tiddlyweb.Bag("Alpha", "http://example.com");
	tiddler = new tiddlyweb.Tiddler("Foo", bag);
	tiddler.get = function(callback, errback) {
		this.etag = '"..."';
		callback(this, "success", _xhr);
	};
	strictEqual(tiddler.etag, undefined);
	tiddler.put(callback, errback);
	strictEqual(tiddler.etag, '"..."');
	strictEqual(_data, tiddler);

	_data = null;
	bag = new tiddlyweb.Bag("Bravo", "http://example.org");
	bag.get = function(callback, errback) {
		_data = { etag: '"~~~"' };
		callback(_data, "success", _xhr);
	};
	strictEqual(bag.etag, undefined);
	bag.put(callback, errback);
	strictEqual(bag.etag, undefined);
	strictEqual(_data.etag, undefined);

	_data = null;
	recipe = new tiddlyweb.Recipe("Omega", "http://example.com");
	recipe.get = function(callback, errback) {
		_data = { etag: '"###"' };
		callback(_data, "success", _xhr);
	};
	strictEqual(recipe.etag, undefined);
	recipe.put(callback, errback);
	strictEqual(recipe.etag, undefined);
	strictEqual(_data.etag, undefined);
});

})(jQuery);
