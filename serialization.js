// chrjs serialization extension
// v0.1.0
// provides entity (de)serialization, e.g. for use in non-TiddlyWeb persistence

/*jslint vars: true, unparam: true, white: true */
/*global jQuery, tiddlyweb */

(function($, tw) {

"use strict";

tw.Tiddler.prototype.serialize = function() {
	var data = this.baseData();
	data.title = this.title;
	var self = this;
	$.each(["bag", "recipe"], function(i, type) {
		var container = self[type];
		if(container) {
			data[type] = {
				name: container.name,
				host: container.host
			};
		}
	});
	if(this.etag) {
		data.etag = this.etag;
	}
	return JSON.stringify(data);
};
tw.Tiddler.deserialize = function(json) {
	var data = JSON.parse(json);
	var tid = new tw.Tiddler(data.title);
	delete data.title;
	if(data.bag) {
		tid.bag = new tw.Bag(data.bag.name, data.bag.host);
		data.bag = data.bag.name;
	}
	if(data.recipe) {
		tid.recipe = new tw.Recipe(data.recipe.name, data.recipe.host);
		delete data.recipe;
	}
	return tid.parse(data);
};

}(jQuery, tiddlyweb));
