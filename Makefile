.PHONY: demo qunit

jquery = "http://ajax.googleapis.com/ajax/libs/jquery/1.6/jquery.min.js"
jquery_full = "http://ajax.googleapis.com/ajax/libs/jquery/1.6/jquery.js"

demo:
	curl -o "doc/jquery.min.js" $(jquery)

qunit:
	mkdir -p test/qunit
	curl -o "test/qunit/jquery.js" $(jquery_full)
	curl -o "test/qunit/qunit.js" \
		"https://raw.github.com/jquery/qunit/master/qunit/qunit.js"
	curl -o "test/qunit/qunit.css" \
		"https://raw.github.com/jquery/qunit/master/qunit/qunit.css"
