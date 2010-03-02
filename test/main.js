test("Tiddler", function() {
	var tiddler, bag, recipe;

	tiddler = new TiddlyWeb.Tiddler("Foo");
	strictEqual(tiddler.title, "Foo");
	strictEqual(tiddler.bag, null);
	strictEqual(tiddler.recipe, null);

	bag = new TiddlyWeb.Bag("Alpha");
	tiddler = new TiddlyWeb.Tiddler("Bar", bag);
	strictEqual(tiddler.title, "Bar");
	strictEqual(tiddler.bag, "Alpha");
	strictEqual(tiddler.recipe, null);

	recipe = new TiddlyWeb.Recipe("Omega");
	tiddler = new TiddlyWeb.Tiddler("Baz", recipe);
	strictEqual(tiddler.title, "Baz");
	strictEqual(tiddler.bag, null);
	strictEqual(tiddler.recipe, "Omega");

	tiddler = new TiddlyWeb.Tiddler("Lorem");
	tiddler.bag = new TiddlyWeb.Bag("Alpha");
	tiddler.recipe = new TiddlyWeb.Recipe("Omega");
	strictEqual(tiddler.title, "Lorem");
	strictEqual(tiddler.bag.name, "Alpha");
	strictEqual(tiddler.recipe.name, "Omega");
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

test("Revisions", function() {
	var tiddler;

	tiddler = new TiddlyWeb.Tiddler("Foo");
	strictEqual(tiddler.revisions.type, "revisions");
	strictEqual(tiddler.revisions.container, null);

	tiddler = new TiddlyWeb.Tiddler("Foo");
	tiddler.bag = new TiddlyWeb.Bag("Alpha");
	tiddler.recipe = new TiddlyWeb.Recipe("Omega");
	strictEqual(tiddler.title, "Foo");
	strictEqual(tiddler.bag.name, "Alpha");
	strictEqual(tiddler.recipe.name, "Omega");

	tiddler = new TiddlyWeb.Tiddler("Foo");
	tiddler.recipe = new TiddlyWeb.Recipe("Omega");
	strictEqual(tiddler.revisions.route(), "{host}/recipes/Omega/tiddlers/Foo/revisions");
	tiddler.recipe.host = "http://example.org";
	strictEqual(tiddler.revisions.route(), "http://example.org/recipes/Omega/tiddlers/Foo/revisions");
	tiddler.bag = new TiddlyWeb.Bag("Alpha");
	strictEqual(tiddler.revisions.route(), "{host}/bags/Alpha/tiddlers/Foo/revisions");
	tiddler.bag.host = "http://example.org";
	strictEqual(tiddler.revisions.route(), "http://example.org/bags/Alpha/tiddlers/Foo/revisions");
});
