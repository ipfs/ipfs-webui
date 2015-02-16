
gulp = node_modules/.bin/gulp

serve: $(gulp)
	$(gulp)

build: $(gulp) $(shell find js html less *.json)
	$(gulp) build

$(gulp):
	npm install
