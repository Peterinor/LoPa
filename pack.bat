@echo on

@rm -f -R dist
@mkdir dist

@cp index.html main.js package.json -f dist/
@cp assets -R -f dist/assets

@mkdir dist\node_modules

@cp node_modules/asap/                       -R dist/node_modules/
@cp node_modules/core-js/                    -R dist/node_modules/
@cp node_modules/encoding/                   -R dist/node_modules/
@cp node_modules/fbjs/                       -R dist/node_modules/
@cp node_modules/iconv-lite/                 -R dist/node_modules/
@cp node_modules/is-stream/                  -R dist/node_modules/
@cp node_modules/isarray/                    -R dist/node_modules/
@cp node_modules/isomorphic-fetch/           -R dist/node_modules/
@cp node_modules/js-tokens/                  -R dist/node_modules/
@cp node_modules/loose-envify/               -R dist/node_modules/
@cp node_modules/node-fetch/                 -R dist/node_modules/
@cp node_modules/object-assign/              -R dist/node_modules/
@cp node_modules/page/                       -R dist/node_modules/
@cp node_modules/path-to-regexp/             -R dist/node_modules/
@cp node_modules/promise/                    -R dist/node_modules/
@cp node_modules/react/                      -R dist/node_modules/
@cp node_modules/react-dom/                  -R dist/node_modules/
@cp node_modules/safer-buffer/               -R dist/node_modules/
@cp node_modules/setimmediate/               -R dist/node_modules/
@cp node_modules/ua-parser-js/               -R dist/node_modules/
@cp node_modules/whatwg-fetch/               -R dist/node_modules/


@rem -------highcharts
@mkdir dist\node_modules\highcharts
@cp node_modules/highcharts/highcharts.js dist/node_modules/highcharts/
@cp node_modules/highcharts/package.json dist/node_modules/highcharts/

@asar pack ./dist app.asar
