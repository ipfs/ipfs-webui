
webpack = node_modules/.bin/webpack
local="http://localhost:5001/ipfs/"
gway="http://gateway.ipfs.io/ipfs/"

clean:
	rm -rf build
	rm -rf publish

deps: node_modules

node_modules: package.json
	npm install
	touch node_modules

build:
	node_modules/.bin/bygg build

serve:
	node_modules/.bin/bygg serve

publish_dir_bygg: deps build
	rm -rf publish
	cp -r build publish

publish_dir_browserify: deps
	rm -rf publish
	mkdir -p publish
	cp -r static publish
	cp -r html/index.html publish
	node_modules/.bin/browserify -t babelify . > publish/bundle.js
	node_modules/.bin/lessc less/bundle.less > publish/style.css

publish: publish_dir_bygg
	ipfs add -r -q publish | tail -n1 >versions/current

	cp -r publish versions/`cat versions/current`
	cat versions/current >>versions/history
	@export hash=`cat versions/current`; \
		echo "here are the links:"; \
		echo $(local)$$hash; \
		echo $(gway)$$hash; \
		echo "now must add webui hash to go-ipfs: $$hash"

.PHONY: build serve clean
