
gulp = node_modules/.bin/gulp
local="http://localhost:8080/ipfs/"
gway="http://gateway.ipfs.io/ipfs/"

clean:
	rm -rf build

serve: $(gulp)
	$(gulp)

build: build/static/bundle.min.js

build/static/bundle.min.js: $(gulp) $(shell find js html less)
	$(gulp) build

$(gulp):
	npm install

publish: clean build
	ipfs add -r -q build | tail -n1 >versions/current
	cp -r static versions/`cat versions/current`
	cat versions/current >>versions/history
	@export hash=`cat versions/current`; \
		echo "here are the links:"; \
		echo $(local)$$hash; \
		echo $(gway)$$hash; \
		echo "now must add webui hash to go-ipfs: $$hash"
