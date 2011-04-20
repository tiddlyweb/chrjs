module("resources");

test("Tiddler", function() {
	var tiddler, bag, recipe;

	tiddler = new tiddlyweb.Tiddler("Foo");
	strictEqual(tiddler.title, "Foo");
	strictEqual(tiddler.bag, null);
	strictEqual(tiddler.recipe, null);
	strictEqual(tiddler.host, undefined);
	strictEqual(tiddler.route(), "{host}/%7B_type%7Ds/%7Bname%7D/tiddlers/Foo");

	bag = new tiddlyweb.Bag("Alpha");
	tiddler = new tiddlyweb.Tiddler("Bar", bag);
	strictEqual(tiddler.title, "Bar");
	strictEqual(tiddler.bag.name, "Alpha");
	strictEqual(tiddler.recipe, null);
	strictEqual(tiddler.route(), "{host}/bags/Alpha/tiddlers/Bar");

	recipe = new tiddlyweb.Recipe("Omega");
	tiddler = new tiddlyweb.Tiddler("Baz", recipe);
	strictEqual(tiddler.title, "Baz");
	strictEqual(tiddler.bag, null);
	strictEqual(tiddler.recipe.name, "Omega");
	strictEqual(tiddler.route(), "{host}/recipes/Omega/tiddlers/Baz");

	tiddler = new tiddlyweb.Tiddler("Lorem");
	tiddler.bag = new tiddlyweb.Bag("Alpha");
	tiddler.recipe = new tiddlyweb.Recipe("Omega");
	strictEqual(tiddler.title, "Lorem");
	strictEqual(tiddler.bag.name, "Alpha");
	strictEqual(tiddler.recipe.name, "Omega");
	strictEqual(tiddler.route(), "{host}/bags/Alpha/tiddlers/Lorem");

	tiddler = new tiddlyweb.Tiddler("foo/bar");
	tiddler.bag = new tiddlyweb.Bag("alpha/bravo", "http://example.org/wiki/");
	strictEqual(tiddler.route(), "http://example.org/wiki/bags/alpha%2Fbravo/tiddlers/foo%2Fbar");
});

test("Bag", function() {
	var bag;

	bag = new tiddlyweb.Bag("Alpha");
	strictEqual(bag.name, "Alpha");
	strictEqual(bag.host, null);
	strictEqual(bag.desc, "");
	strictEqual(bag.policy instanceof tiddlyweb.Policy, true);
	strictEqual(bag.policy.read, undefined);

	bag = new tiddlyweb.Bag("Bravo", "/~user/");
	strictEqual(bag.host, "/~user");
	strictEqual(bag.route(), "/~user/bags/Bravo");

	bag = new tiddlyweb.Bag("Charlie");
	strictEqual(bag.route(), "{host}/bags/Charlie");
	bag.host = "http://example.com";
	strictEqual(bag.route(), "http://example.com/bags/Charlie");

	bag = new tiddlyweb.Bag("Delta");
	bag.policy = new tiddlyweb.Policy({
		read: ["R:ADMIN"],
		write: ["R:ADMIN"],
		create: ["R:ADMIN"],
		"delete": ["R:ADMIN"],
		manage: ["R:ADMIN"],
		accept: ["R:ADMIN"],
		owner: "admin"
	});
	strictEqual(bag.policy.read[0], "R:ADMIN");
	strictEqual(bag.policy.owner, "admin");
	strictEqual(bag.policy instanceof tiddlyweb.Policy, true);
});

test("Recipe", function() {
	var recipe;

	recipe = new tiddlyweb.Recipe("Omega");
	strictEqual(recipe.name, "Omega");
	strictEqual(recipe.host, null);
	strictEqual(recipe.desc, "");
	strictEqual(recipe.policy instanceof tiddlyweb.Policy, true);
	strictEqual(recipe.policy.read, undefined);
	strictEqual(recipe.recipe.length, 0);

	recipe = new tiddlyweb.Recipe("Psi", "example.com");
	strictEqual(recipe.host, "example.com");
	strictEqual(recipe.route(), "example.com/recipes/Psi");

	recipe = new tiddlyweb.Recipe("Chi");
	strictEqual(recipe.route(), "{host}/recipes/Chi");
	recipe.host = "http://example.com";
	strictEqual(recipe.route(), "http://example.com/recipes/Chi");

	recipe = new tiddlyweb.Recipe("Phi");
	recipe.policy = new tiddlyweb.Policy({
		read: ["R:ADMIN"],
		manage: ["R:ADMIN"],
		owner: "admin"
	});
	strictEqual(recipe.policy.read[0], "R:ADMIN");
	strictEqual(recipe.policy.owner, "admin");
	strictEqual(recipe.policy.create, undefined);
	strictEqual(recipe.policy instanceof tiddlyweb.Policy, true);
});

test("Collection: Bags", function() {
	var bags;

	bags = new tiddlyweb.Collection("bags");
	strictEqual(bags.route(), "{host}/bags");
	bags.host = "http://example.com";
	strictEqual(bags.route(), "http://example.com/bags");

	bags = new tiddlyweb.Collection("bags", "http://example.com");
	strictEqual(bags.route(), "http://example.com/bags");
});

test("Collection: Recipes", function() {
	var recipes;

	recipes = new tiddlyweb.Collection("recipes");
	strictEqual(recipes.route(), "{host}/recipes");
	recipes.host = "http://example.com";
	strictEqual(recipes.route(), "http://example.com/recipes");

	recipes = new tiddlyweb.Collection("recipes", "http://example.com");
	strictEqual(recipes.route(), "http://example.com/recipes");
});

test("Collection: Bag Tiddlers", function() {
	var bag, tiddlers, data;

	bag = new tiddlyweb.Bag("Alpha", "http://example.com");
	strictEqual(bag.tiddlers()._type, "tiddlers");
	strictEqual(bag.tiddlers().container._type, "bag");
	strictEqual(bag.tiddlers().route(), "http://example.com/bags/Alpha/tiddlers");

	data = [
		{
			"title": "Foo", "bag": "Alpha", "recipe": null, "type": "None",
			"revision": 3, "permissions": [],
			"created": "20100712000000", "creator": "fnd",
			"modified": "20100612104500", "modifier": "fnd",
			"fields": {}, "tags": ["dummy"]
		},
		{
			"title": "Bar", "bag": "Alpha", "recipe": null, "type": "None",
			"revision": 1, "permissions": [],
			"created": "20100712010000", "creator": "cdent",
			"modified": "20100612105000", "modifier": "cdent",
			"fields": {}, "tags": ["dummy"]
		}
	];

	tiddlers = bag.tiddlers().parse(data);
	strictEqual(tiddlers.length, 2);
	strictEqual(tiddlers[0].title, "Foo");
	strictEqual(tiddlers[0].bag.name, "Alpha");
	strictEqual(tiddlers[0].bag.host, "http://example.com");
	strictEqual(tiddlers[0].recipe, null);
	strictEqual(tiddlers[1].title, "Bar");
	strictEqual(tiddlers[1].bag.name, "Alpha");
	strictEqual(tiddlers[1].bag.host, "http://example.com");
	strictEqual(tiddlers[1].recipe, null);
});

test("Collection: Recipe Tiddlers", function() {
	var recipe, tiddlers, data;

	recipe = new tiddlyweb.Recipe("Omega", "http://example.com");
	strictEqual(recipe.tiddlers()._type, "tiddlers");
	strictEqual(recipe.tiddlers().container._type, "recipe");
	strictEqual(recipe.tiddlers().route(), "http://example.com/recipes/Omega/tiddlers");

	data = [
		{
			"title": "Foo", "bag": "Alpha", "recipe": "Omega", "type": "None",
			"revision": 3, "permissions": [],
			"created": "20100712000000", "creator": "fnd",
			"modified": "20100612104500", "modifier": "fnd",
			"fields": {}, "tags": ["dummy"]
		},
		{
			"title": "Bar", "bag": "Bravo", "recipe": "Omega", "type": "None",
			"revision": 1, "permissions": [],
			"created": "20100712010000", "creator": "cdent",
			"modified": "20100612105000", "modifier": "cdent",
			"fields": {}, "tags": ["dummy"]
		}
	];

	tiddlers = recipe.tiddlers().parse(data);
	strictEqual(tiddlers.length, 2);
	strictEqual(tiddlers[0].title, "Foo");
	strictEqual(tiddlers[0].bag.name, "Alpha");
	strictEqual(tiddlers[0].bag.host, "http://example.com");
	strictEqual(tiddlers[0].recipe.name, "Omega");
	strictEqual(tiddlers[0].recipe.host, "http://example.com");
	strictEqual(tiddlers[0].created instanceof Date, true);
	strictEqual(tiddlers[0].modified instanceof Date, true);
	strictEqual(tiddlers[1].title, "Bar");
	strictEqual(tiddlers[1].bag.name, "Bravo");
	strictEqual(tiddlers[1].bag.host, "http://example.com");
	strictEqual(tiddlers[1].recipe.name, "Omega");
	strictEqual(tiddlers[1].recipe.host, "http://example.com");
	strictEqual(tiddlers[1].created instanceof Date, true);
	strictEqual(tiddlers[1].modified instanceof Date, true);
});

test("Collection: Search Tiddlers", function() {
	var search, tiddlers, data;

	search = new tiddlyweb.Search("lipsum", "http://example.com");
	strictEqual(search._type, "search");
	strictEqual(search.route(), "http://example.com/search?q=lipsum");

	data = [
		{
			"title": "Foo", "bag": "Alpha", "recipe": "Omega", "type": "None",
			"revision": 3, "permissions": [],
			"created": "20100712000000", "creator": "fnd",
			"modified": "20100612104500", "modifier": "fnd",
			"fields": {}, "tags": ["dummy"]
		},
		{
			"title": "Bar", "bag": "Bravo", "recipe": "Omega", "type": "None",
			"revision": 1, "permissions": [],
			"created": "20100712010000", "creator": "cdent",
			"modified": "20100612105000", "modifier": "cdent",
			"fields": {}, "tags": ["dummy"]
		}
	];

	tiddlers = search.parse(data);
	strictEqual(tiddlers.length, 2);
	strictEqual(tiddlers[0].title, "Foo");
	strictEqual(tiddlers[0].bag.name, "Alpha");
	strictEqual(tiddlers[0].bag.host, "http://example.com");
	strictEqual(tiddlers[0].created instanceof Date, true);
	strictEqual(tiddlers[0].modified instanceof Date, true);
	strictEqual(tiddlers[1].title, "Bar");
	strictEqual(tiddlers[1].bag.name, "Bravo");
	strictEqual(tiddlers[1].bag.host, "http://example.com");
	strictEqual(tiddlers[1].created instanceof Date, true);
	strictEqual(tiddlers[1].modified instanceof Date, true);
});

test("Collection: Tiddler Revisions", function() {
	var tiddler;

	tiddler = new tiddlyweb.Tiddler("Foo");
	strictEqual(tiddler.revisions()._type, "revisions");
	strictEqual(tiddler.revisions().container, null);

	tiddler = new tiddlyweb.Tiddler("Foo");
	tiddler.bag = new tiddlyweb.Bag("Alpha");
	tiddler.recipe = new tiddlyweb.Recipe("Omega");
	strictEqual(tiddler.title, "Foo");
	strictEqual(tiddler.bag.name, "Alpha");
	strictEqual(tiddler.recipe.name, "Omega");

	tiddler = new tiddlyweb.Tiddler("Foo");
	tiddler.recipe = new tiddlyweb.Recipe("Omega");
	strictEqual(tiddler.revisions().route(), "{host}/recipes/Omega/tiddlers/Foo/revisions");
	tiddler.recipe.host = "http://example.org";
	strictEqual(tiddler.revisions().route(), "http://example.org/recipes/Omega/tiddlers/Foo/revisions");
	tiddler.bag = new tiddlyweb.Bag("Alpha");
	strictEqual(tiddler.revisions().route(), "{host}/bags/Alpha/tiddlers/Foo/revisions");
	tiddler.bag.host = "http://example.org";
	strictEqual(tiddler.revisions().route(), "http://example.org/bags/Alpha/tiddlers/Foo/revisions");
});

test("timestamps", function() {
	var bag = new tiddlyweb.Bag("Alpha", "http://example.com");
	var json = {
		"title": "Foo", "bag": bag.name, "recipe": null, "type": "None",
		"revision": 1, "permissions": [],
		"created": null, "creator": "fnd",
		"modified": null, "modifier": "fnd",
		"fields": {}, "tags": []
	};
	var data = [
		$.extend({}, json, {
			"created": "20101023121010",
			"modified": "20101023121030"
		}),
		$.extend({}, json, {
			"created": "201010231210",
			"modified": "201010231210"
		})
	];
	var tiddlers = bag.tiddlers().parse(data);

	strictEqual(tiddlers[0].created.getSeconds(), 10);
	strictEqual(tiddlers[0].modified.getSeconds(), 30);
	strictEqual(tiddlers[1].created.getSeconds(), 0);
	strictEqual(tiddlers[1].modified.getSeconds(), 0);
});

test("JSON", function() {
	var tiddler = new tiddlyweb.Tiddler("Foo");
	tiddler.text = "Bar";
	var json = tiddler.toJSON();

	strictEqual(json, '{"text":"Bar"}');
});
