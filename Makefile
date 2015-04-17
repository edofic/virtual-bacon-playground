app.js: js/*
	browserify js/main.js > app.js

all: app.js

.PHONY: all
