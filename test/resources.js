module("resources");

test("Tiddler", function() {
	var tiddler, bag, recipe;

	tiddler = new TiddlyWeb.Tiddler("Foo");
	strictEqual(tiddler.title, "Foo");
	strictEqual(tiddler.bag, null);
	strictEqual(tiddler.recipe, null);
	strictEqual(tiddler.host, undefined);
	strictEqual(tiddler.route(), "{host}/{_type}s/{name}/tiddlers/Foo");

	bag = new TiddlyWeb.Bag("Alpha");
	tiddler = new TiddlyWeb.Tiddler("Bar", bag);
	strictEqual(tiddler.title, "Bar");
	strictEqual(tiddler.bag.name, "Alpha");
	strictEqual(tiddler.recipe, null);
	strictEqual(tiddler.route(), "{host}/bags/Alpha/tiddlers/Bar");

	recipe = new TiddlyWeb.Recipe("Omega");
	tiddler = new TiddlyWeb.Tiddler("Baz", recipe);
	strictEqual(tiddler.title, "Baz");
	strictEqual(tiddler.bag, null);
	strictEqual(tiddler.recipe.name, "Omega");
	strictEqual(tiddler.route(), "{host}/recipes/Omega/tiddlers/Baz");

	tiddler = new TiddlyWeb.Tiddler("Lorem");
	tiddler.bag = new TiddlyWeb.Bag("Alpha");
	tiddler.recipe = new TiddlyWeb.Recipe("Omega");
	strictEqual(tiddler.title, "Lorem");
	strictEqual(tiddler.bag.name, "Alpha");
	strictEqual(tiddler.recipe.name, "Omega");
	strictEqual(tiddler.route(), "{host}/bags/Alpha/tiddlers/Lorem");
});

test("Bag", function() {
	var bag;

	bag = new TiddlyWeb.Bag("Alpha");
	strictEqual(bag.name, "Alpha");
	strictEqual(bag.host, null);

	bag = new TiddlyWeb.Bag("Bravo", "/~user/");
	strictEqual(bag.host, "/~user");
	strictEqual(bag.route(), "/~user/bags/Bravo");

	bag = new TiddlyWeb.Bag("Charlie");
	strictEqual(bag.route(), "{host}/bags/Charlie");
	bag.host = "http://example.com";
	strictEqual(bag.route(), "http://example.com/bags/Charlie");
});

test("Recipe", function() {
	var recipe;

	recipe = new TiddlyWeb.Recipe("Omega");
	strictEqual(recipe.name, "Omega");
	strictEqual(recipe.host, null);

	recipe = new TiddlyWeb.Recipe("Psi", "example.com");
	strictEqual(recipe.host, "example.com");
	strictEqual(recipe.route(), "example.com/recipes/Psi");

	recipe = new TiddlyWeb.Recipe("Chi");
	strictEqual(recipe.route(), "{host}/recipes/Chi");
	recipe.host = "http://example.com";
	strictEqual(recipe.route(), "http://example.com/recipes/Chi");
});

test("Collection: Bags", function() {
	var bags;

	bags = new TiddlyWeb.Collection("bags");
	strictEqual(bags.route(), "{host}/bags");
	bags.host = "http://example.com";
	strictEqual(bags.route(), "http://example.com/bags");

	bags = new TiddlyWeb.Collection("bags", "http://example.com");
	strictEqual(bags.route(), "http://example.com/bags");
});

test("Collection: Recipes", function() {
	var recipes;

	recipes = new TiddlyWeb.Collection("recipes");
	strictEqual(recipes.route(), "{host}/recipes");
	recipes.host = "http://example.com";
	strictEqual(recipes.route(), "http://example.com/recipes");

	recipes = new TiddlyWeb.Collection("recipes", "http://example.com");
	strictEqual(recipes.route(), "http://example.com/recipes");
});

test("Collection: Bag Tiddlers", function() {
	var bag;

	bag = new TiddlyWeb.Bag("Alpha", "http://example.com");
	strictEqual(bag.tiddlers()._type, "tiddlers");
	strictEqual(bag.tiddlers().container._type, "bag");
	strictEqual(bag.tiddlers().route(), "http://example.com/bags/Alpha/tiddlers");
});

test("Collection: Recipe Tiddlers", function() {
	var recipe;

	recipe = new TiddlyWeb.Recipe("Omega", "http://example.com");
	strictEqual(recipe.tiddlers()._type, "tiddlers");
	strictEqual(recipe.tiddlers().container._type, "recipe");
	strictEqual(recipe.tiddlers().route(), "http://example.com/recipes/Omega/tiddlers");
});

test("Collection: Tiddler Revisions", function() {
	var tiddler;

	tiddler = new TiddlyWeb.Tiddler("Foo");
	strictEqual(tiddler.revisions()._type, "revisions");
	strictEqual(tiddler.revisions().container, null);

	tiddler = new TiddlyWeb.Tiddler("Foo");
	tiddler.bag = new TiddlyWeb.Bag("Alpha");
	tiddler.recipe = new TiddlyWeb.Recipe("Omega");
	strictEqual(tiddler.title, "Foo");
	strictEqual(tiddler.bag.name, "Alpha");
	strictEqual(tiddler.recipe.name, "Omega");

	tiddler = new TiddlyWeb.Tiddler("Foo");
	tiddler.recipe = new TiddlyWeb.Recipe("Omega");
	strictEqual(tiddler.revisions().route(), "{host}/recipes/Omega/tiddlers/Foo/revisions");
	tiddler.recipe.host = "http://example.org";
	strictEqual(tiddler.revisions().route(), "http://example.org/recipes/Omega/tiddlers/Foo/revisions");
	tiddler.bag = new TiddlyWeb.Bag("Alpha");
	strictEqual(tiddler.revisions().route(), "{host}/bags/Alpha/tiddlers/Foo/revisions");
	tiddler.bag.host = "http://example.org";
	strictEqual(tiddler.revisions().route(), "http://example.org/bags/Alpha/tiddlers/Foo/revisions");
});
