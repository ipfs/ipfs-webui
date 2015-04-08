
webpack = node_modules/.bin/webpack
local="http://localhost:8080/ipfs/"
gway="http://gateway.ipfs.io/ipfs/"

clean:
	rm -rf build

serve: $(webpack)
	node dev

build: build/bundle.min.js

build/bundle.min.js: $(webpack)
	$(webpack)
	cp -r static build/static
	cp static/html/index.html build

$(webpack):
	npm install

publish: clean build
	ipfs add -r -q build | tail -n1 >versions/current
	cp -r build versions/`cat versions/current`
	cat versions/current >>versions/history
	@export hash=`cat versions/current`; \
		echo "here are the links:"; \
		echo $(local)$$hash; \
		echo $(gway)$$hash; \
		echo "now must add webui hash to go-ipfs: $$hash"
