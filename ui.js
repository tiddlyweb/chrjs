// chrjs UI extension
// v0.5.0

(function($) {

tiddlyweb.Recipe.prototype.render = function() {
	var lbl = $("<h3 />");
	$("<a />").attr("href", this.route()).text(this.name).appendTo(lbl);
	var desc = $("<p />").text(this.desc);
	this.policy.constraints = ["read", "manage", "owner"];
	var policy = this.policy.render();
	var content = $.map(this.recipe, function(item, i) {
		return item[1] ? item[0] + "?" + item[1] : item[0];
	}).join("\n");
	content = $("<pre />").text(content);
	var container = $("<article />").data("entity", this).
		append(lbl).append(desc).append(policy).append(content);

	editable("p, pre", container[0], tiddlyweb.Recipe.onChange);

	return container;
};
tiddlyweb.Recipe.onChange = function(ev) {
	var el = $(this);
	var recipe = el.closest("article").data("entity");
	switch(this.nodeName.toLowerCase()) {
		case "p": // TODO: enforce single line
			recipe.desc = el.text();
			break;
		case "pre":
			var lines = el.html().split("\n");
			recipe.recipe = $.map(lines, function(item, i) {
				var arr = item.split("?");
				var bag = arr.shift();
				var filter = arr.join("?"); // NB: components expected to be URI-encoded
				return [[bag, filter]]; // nested array prevents flattening
			});
			break;
		default:
			break;
	}
};

tiddlyweb.Bag.prototype.render = function() {
	var lbl = $("<h3 />");
	$("<a />").attr("href", this.route()).text(this.name).appendTo(lbl);
	var desc = $("<p />").text(this.desc);
	var policy = this.policy ? this.policy.render() : null;
	var container = $("<article />").data("entity", this).
		append(lbl).append(desc).append(policy);

	editable("p, pre", container[0], tiddlyweb.Bag.onChange);

	return container;
};
tiddlyweb.Bag.onChange = function(ev) { // TODO: DRY (cf. Recipe)
	var el = $(this);
	var bag = el.closest("article").data("entity");
	switch(this.nodeName.toLowerCase()) {
		case "p": // TODO: enforce single line
			bag.desc = el.text();
			break;
		default:
			break;
	}
};

tiddlyweb.Tiddler.prototype.render = function() {
	var lbl = $("<h3 />");
	$("<a />").attr("href", this.route()).text(this.title).appendTo(lbl);
	// TODO: tags
	var txt = $("<pre />").text(this.text);
	var container = $("<article />").data("entity", this).
		append(lbl).append(txt);

	editable("p, pre", container[0], tiddlyweb.Tiddler.onChange);

	return container;
};
tiddlyweb.Tiddler.onChange = function(ev) { // TODO: DRY (cf. Recipe)
	var el = $(this);
	var tiddler = el.closest("article").data("entity");
	switch(this.nodeName.toLowerCase()) {
		case "pre": // TODO: enforce single line
			tiddler.text = el.html();
			break;
		default:
			break;
	}
};

tiddlyweb.Policy.prototype.render = function() {
	var self = this;
	var specialValues = tiddlyweb.Policy.specialValues;
	// TODO: templating
	var table = $('<table class="policy"><thead><tr><th /></tr></thead></table>').
		data("policy", this);
	$("<caption />").text("owner: " + this.owner).prependTo(table); // XXX: inelegant -- XXX: i18n
	var row = table.find("tr:first");
	var users = [];
	var roles = [];
	$.each(this.constraints, function(i, constraint) {
		if(constraint != "owner" && self[constraint]) {
			$("<th />").text(constraint).appendTo(row); // XXX: i18n
			$.each(self[constraint], function(i, item) {
				if(item.indexOf("R:") == 0) {
					pushUnique(item, roles);
				} else if($.inArray(item, specialValues) == -1) {
					pushUnique(item, users);
				}
			});
		}
	});

	var tbody = $("<tbody />").appendTo(table);
	var entries = specialValues.concat(users).concat(roles);
	$.each(entries, function(i, entry) {
		var row = $("<tr />").appendTo(tbody);
		if($.inArray(entry, specialValues) != -1) {
			row.addClass("special"); // XXX: rename
		}
		$("<td />").text(entry).appendTo(row);
		$.each(self.constraints, function(i, constraint) {
			if(constraint != "owner" && self[constraint]) {
				var cell = $('<td><input type="checkbox" /></td>').appendTo(row);
				if(self[constraint].length == 0) {
					var column = $.inArray(constraint, self.constraints) + 1;
					cell = cell.closest("table").find("tbody tr:first td").eq(column);
					cell.find("input").attr("checked", "checked");
				} else if($.inArray(entry, self[constraint]) != -1) {
					cell.find("input").attr("checked", "checked");
				}
			}
		});
	});

	$("input[type=checkbox]", tbody[0]).live("change", tiddlyweb.Policy.onChange);

	var addRow = function(ev, cell) { // XXX: use as both event handler and regular function hacky?
		var el = cell || $(this);
		if(cell || el.val().length > 0) {
			var field = $('<input type="text" placeholder="new user/role" />'). // XXX: i18n
				change(addRow).hide();
			var tbody = el.closest("tbody");
			el.closest("tr").clone().
				find("td:first").empty().append(field).end().
				find("input[type=checkbox]").removeAttr("checked").end().
				appendTo(tbody);
			field.fadeIn(); // slideDown preferable, but problematic for TRs
		}
	};
	addRow(null, $("tr:last td:first", tbody));

	return table;
};
tiddlyweb.Policy.specialValues = ["anonymous", "ANY", "NONE"]; // XXX: rename -- XXX: i18n
tiddlyweb.Policy.onChange = function(ev) {
	var el = $(this);
	var cell = el.closest("td");
	var tbody = cell.closest("tbody");
	var table = tbody.closest("table");
	var policy = table.data("policy");

	var entry = cell.closest("tr").find("td:first");
	var field = entry.find("input");
	entry = field.length ? field.val() : entry.text();

	var colIndex = cell.prevAll().length;
	var constraint = table.find("thead th").eq(colIndex).text(); // XXX: brittle (i18n)
	var entries = policy[constraint];

	var checked = $(el).attr("checked");
	if($.inArray(entry, tiddlyweb.Policy.specialValues) == -1) {
		if(!checked) {
			removeItem(item, entries || []);
		} else {
			if(entries && entries.length) {
				pushUnique(entry, policy[constraint]);
			} else {
				policy[constraint] = [entry];
			}
		}
		// reset special values
		$.each(tiddlyweb.Policy.specialValues, function(i, item) {
			removeItem(item, entries || []);
		});
		$("tr.special", tbody).
			find("td:nth-child(" + (colIndex + 1) + ") input[type=checkbox]").
			removeAttr("checked"); // XXX: redraw entire table instead?
	} else {
		policy[constraint] = entry == "anonymous" ? [] : [entry];
		// reset all entries -- XXX: DRY (see above)
		cell.closest("tr").siblings().
			find("td:nth-child(" + (colIndex + 1) + ") input[type=checkbox]").
			removeAttr("checked");
	}
};

var editable = function(selector, context, onChange) {
	$(selector, context).attr("contentEditable", "true"). // XXX: inserting line breaks sometimes leads to new paragraph elements being created
		live("focus", function(ev) {
			$(this).addClass("active");
		}).live("blur", function(ev) {
			var el = $(this).removeClass("active");
			var txt = el.html().replace(/<br>|<div>/g, "\n").replace(/<\/div>/g, ""); // XXX: sometimes can contain "&nbsp;"
			el.html(txt);
			onChange.apply(this, arguments);
		});
};

var pushUnique = function(val, arr) {
	if($.inArray(val, arr) == -1) {
		arr.push(val);
	}
};

var removeItem = function(val, arr) {
	var pos = $.inArray(val, arr);
	if(pos != -1) {
		arr.splice(pos, 1);
	}
};

})(jQuery);
