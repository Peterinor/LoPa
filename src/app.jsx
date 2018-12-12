
var path = require('path');

var React = require('react');
var ReactDOM = require('react-dom');

var page = require('page');

var alarm = require('./alarm');

// react views
var LogParser = require('./views/LogParser');
var Parsing = require('./views/Parsing');
var Parsed = require('./views/Parsed');
var MassView = require('./views/MassView');
var Analysis = require('./views/Analysis');

var parserName = "FocMsgParser";
var $pl = document.getElementById('parse-list');
var $pname = document.getElementById('parser-name');
$pl.onchange = function(e) {
    var t = e.target;
    parserName = t.attributes['data-name'].value || parserName;
    $pname.innerHTML = parserName;
}

function createParser(name) {
    try {
        var pR = require('./parsers/' + parserName);
        return new pR;
    } catch (e) {
        console.log(e);
        return null;
    }
}

const EventEmitter = require('events');
class App extends EventEmitter {
    constructor() {
        super();

        this.allLog = null;
        this.files = [];
        this.allParsedFils = [];
        this.percent = 0;

        this.setParser();
    }

    setParser() {
        this.parser = createParser();
        this.bindEvents(this.parser);
        return this.parser;
    }
    gotoHomeWhenAllLogNotSet() {
        if (!this.allLog) {
            this.go('/');
            return true;
        }
        return false;
    }

    go(to) {
        if ('string' === typeof(to)) {
            page(to);
        } else if ('number' === typeof(to)) {
            var n = to;
            window.history.go(n);
        }
    }

    reset() {
        this.percent = 0;
        this.files = [];

        this.allLog = null;
        this.allParsedFils = [];
    }

    stop() {
        if(this.parser) {
            this.parser.stop();
        }
    }

    appendToParse(files) {
        var self = this;
        var parser = this.setParser()

        var x = 0;
        files.forEach(f => {
            var ff = self.allParsedFils.find(fx => fx.path == f);
            if (ff) {
                alarm(ff.name + '文件已被分析', 'warning');
                return;
            }
            x++;
            parser.append(f)
        });

        if (x) {
            this.go('/parsing')
            parser.parse();
        }

    }

    merge_log(log) {
        var self = this;
        if (!self.allLog) {
            self.allLog = log;
            return;
        }

        var allLog = self.allLog;
        allLog.count += log.count;
        log.keys.forEach(k => {
            var logs = allLog.dataHolder[k];
            if (!logs) {
                allLog.keys.push(k);
                allLog.dataHolder[k] = log.dataHolder[k];
            } else {
                var ll = log.dataHolder[k];
                ll.forEach(l => logs.push(l));
            }
        })
    }

    bindEvents(parser) {

        var self = this;
        parser.on('begin-parse', files => {
            files.forEach(f => {
                self.files.push({
                    path: f,
                    name: path.basename(f),
                    percent: 0
                });
            });
            self.percent = 0;
            self.emit('begin-parse', files);
        });

        var op = 0;
        parser.on('begin-parse-file', file => {
            op = 0;
            self.emit('begin-parse-file', file);
        });

        parser.on('parsing-file', (file, pec) => {
            var fx = self.files.find(f => f.path == file);
            fx.percent = pec;

            var totalPercent = self.allParsedFils.length / self.files.length * 100;
            self.files.forEach(f => {
                if (f.percent === 100) return;
                totalPercent += f.percent / self.files.length;
            });
            var np = Math.round(100 * totalPercent) / 100;
            if (np - op > 1 & op != 100) {
                self.percent = op = np;
            }
            self.emit('parsing-file', file, self.percent);
        });

        parser.on('end-parse-file', (file, log) => {
            self.merge_log(log);

            var fx = self.files.find(f => f.path == file)
            fx.percent = 100;

            self.allParsedFils.push(fx);

            self.percent = Math.round(10000 * (self.allParsedFils.length / self.files.length)) / 100;

            self.emit('end-parse-file', file, log);
        });

        parser.on('end-parse', (files) => {
            self.log = {
                keys: self.allLog.keys,
                count: self.allLog.count,
                countByKey: (function() {
                    var x = {};
                    self.allLog.keys.forEach((k) => {
                        x[k] = self.allLog.dataHolder[k].length;
                    });
                    return x;
                })()
            };
            self.percent = 100;
            self.emit('end-parse', files);
        });

    }
}

const $root = document.getElementById('root')
var app = window.app = new App();

page('/', () => {
    ReactDOM.render(
        <LogParser app={app} />,
        $root
    );
});


page('/parsing', () => {
    ReactDOM.render(
        <Parsing app={app} />,
        $root
    );
});

page('/parsed', () => {
    ReactDOM.render(
        <Parsed app={app} />,
        $root
    );
});

page('/view/log/detail/:name/:idx', ctx => {
    if(app.gotoHomeWhenAllLogNotSet()) return;

    var logH = app.allLog.dataHolder[ctx.params.name];
    var idx = parseInt(ctx.params.idx) % logH.length;
    var mass = JSON.stringify(logH[idx].data);
    ReactDOM.render(
        <MassView app={app} massInfo={mass} />,
        $root
    );
});

page('/analysis/:key', ctx => {
    if(app.gotoHomeWhenAllLogNotSet()) return;

    var key = ctx.params.key;
    if(!key) return;

    ReactDOM.render(
        <Analysis app={app} logKey={key} />,
        $root
    );
});

page('*', (ctx, next) => {
    console.log(ctx);
    console.log('no router found!');

    app.go('/');
});

var s = window.location.href;
var file = 'index.html';
var base = s.substring(0, s.lastIndexOf(file) + file.length);

page.base(base);
page.start({
    hashbang: true
});

app.go('/');

const {
    ipcRenderer
} = require('electron');
ipcRenderer.on('open.file', (e, files) => {
    if (!files) return;
    app.appendToParse(files);
});

$root.ondragover 
    = $root.ondragleave 
    = $root.ondragend = () => {
    return false;
}

$root.ondrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
        if(e.dataTransfer.files) {
            var files = Array.prototype.map.call(e.dataTransfer.files, f => f.path);
            app.appendToParse(files);
        }
    }
    return false;
}