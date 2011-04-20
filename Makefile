.PHONY: demo qunit

jquery = "http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.min.js"
jquery_full = "http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.js"
jquery-json = "http://jquery-json.googlecode.com/files/jquery.json-2.2.min.js"
jquery-json_full = "http://jquery-json.googlecode.com/files/jquery.json-2.2.js"

demo:
	curl -o "doc/jquery-json.min.js" $(jquery-json)
	curl -o "doc/jquery.min.js" $(jquery)

qunit:
	curl -o "test/jquery-json.js" $(jquery-json_full)
	mkdir -p test/qunit
	curl -o "test/qunit/jquery.js" $(jquery_full)
	curl -o "test/qunit/qunit.js" \
		"http://github.com/jquery/qunit/raw/master/qunit/qunit.js"
	curl -o "test/qunit/qunit.css" \
		"http://github.com/jquery/qunit/raw/master/qunit/qunit.css"
