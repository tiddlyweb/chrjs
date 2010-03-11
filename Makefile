qunit:
	curl -o "test/jquery-json.min.js" \
		"http://jquery-json.googlecode.com/files/jquery.json-2.2.min.js"
	mkdir -p test/qunit
	curl -o "test/qunit/jquery.min.js" \
		"http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.min.js"
	curl -o "test/qunit/qunit.js" \
		"http://github.com/jquery/qunit/raw/master/qunit/qunit.js"
	curl -o "test/qunit/qunit.css" \
		"http://github.com/jquery/qunit/raw/master/qunit/qunit.css"
