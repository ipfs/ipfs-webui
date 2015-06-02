
webpack = node_modules/.bin/webpack
local="http://localhost:5001/ipfs/"
gway="http://gateway.ipfs.io/ipfs/"

clean:
	rm -rf build
	rm -rf publish

serve:
	node_modules/.bin/bygg serve

publish: clean
	npm install
	mkdir publish
	cp -r static publish
	cp -r html/index.html publish
	node_modules/.bin/browserify -t reactify . > publish/bundle.js
	node_modules/.bin/lessc less/bundle.less > publish/style.css
	ipfs add -r -q publish | tail -n1 >versions/current

	cp -r publish versions/`cat versions/current`
	cat versions/current >>versions/history
	@export hash=`cat versions/current`; \
		echo "here are the links:"; \
		echo $(local)$$hash; \
		echo $(gway)$$hash; \
		echo "now must add webui hash to go-ipfs: $$hash"
