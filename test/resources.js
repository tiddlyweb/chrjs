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
	strictEqual(bag.policy, null);

	bag = new tiddlyweb.Bag("Bravo", "/~user/");
	strictEqual(bag.host, "/~user");
	strictEqual(bag.route(), "/~user/bags/Bravo");

	bag = new tiddlyweb.Bag("Charlie");
	strictEqual(bag.route(), "{host}/bags/Charlie");
	bag.host = "http://example.com";
	strictEqual(bag.route(), "http://example.com/bags/Charlie");
});

test("Recipe", function() {
	var recipe;

	recipe = new tiddlyweb.Recipe("Omega");
	strictEqual(recipe.name, "Omega");
	strictEqual(recipe.host, null);
	strictEqual(recipe.desc, "");
	strictEqual(recipe.policy, null);
	strictEqual(recipe.recipe.length, 0);

	recipe = new tiddlyweb.Recipe("Psi", "example.com");
	strictEqual(recipe.host, "example.com");
	strictEqual(recipe.route(), "example.com/recipes/Psi");

	recipe = new tiddlyweb.Recipe("Chi");
	strictEqual(recipe.route(), "{host}/recipes/Chi");
	recipe.host = "http://example.com";
	strictEqual(recipe.route(), "http://example.com/recipes/Chi");
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
	var bag;

	bag = new tiddlyweb.Bag("Alpha", "http://example.com");
	strictEqual(bag.tiddlers()._type, "tiddlers");
	strictEqual(bag.tiddlers().container._type, "bag");
	strictEqual(bag.tiddlers().route(), "http://example.com/bags/Alpha/tiddlers");
});

test("Collection: Recipe Tiddlers", function() {
	var recipe;

	recipe = new tiddlyweb.Recipe("Omega", "http://example.com");
	strictEqual(recipe.tiddlers()._type, "tiddlers");
	strictEqual(recipe.tiddlers().container._type, "recipe");
	strictEqual(recipe.tiddlers().route(), "http://example.com/recipes/Omega/tiddlers");
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
