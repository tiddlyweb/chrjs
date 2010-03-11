.PHONY: demo qunit

jquery = "http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.min.js"
jquery-json = "http://jquery-json.googlecode.com/files/jquery.json-2.2.min.js"

demo:
	curl -o "doc/jquery-json.min.js" $(jquery-json)
	curl -o "doc/jquery.min.js" $(jquery)

qunit:
	curl -o "test/jquery-json.min.js" $(jquery-json)
	mkdir -p test/qunit
	curl -o "test/qunit/jquery.min.js" $(jquery)
	curl -o "test/qunit/qunit.js" \
		"http://github.com/jquery/qunit/raw/master/qunit/qunit.js"
	curl -o "test/qunit/qunit.css" \
		"http://github.com/jquery/qunit/raw/master/qunit/qunit.css"
