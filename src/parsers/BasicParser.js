var ParserBase = require('./ParserBase.js');

/*
 * <parseFn> is function like this:
 * function parse(file, parsed, process) { ... }
 * -----------
 * :file is the file to be parsed
 * :parsed is a callback for the file has been parsed
 * :process is a callback for the file is being processing
 */
class BasicParser extends ParserBase {
    constructor(parseFn) {
        super();

        this.parseFn = parseFn;

        this.files = [];
        this.parserCtrl = {};
    }

    parse() {
        var parseX = this.parseFn;
        var self = this;
        var filesToBeParsed = this.files.map(f => f);

        self.emit('begin-parse', self.files);
        self.files.forEach(file => {
            self.emit('begin-parse-file', file);
            self.parserCtrl[file] = parseX(file, log => {

                self.emit('end-parse-file', file, log);

                filesToBeParsed.erase(file);
                if (filesToBeParsed.length == 0) {
                    self.emit('end-parse', self.files);

                    // avoid memory leak
                    delete this.files;
                    delete this.parserCtrl;
                }

            }, pec => {
                var p = Math.round(pec);

                self.emit('parsing-file', file, p);
            });
        });
    }

    stop() {

        Object.keys(this.parserCtrl)
            .forEach(k => {
                var rl = this.parserCtrl[k];
                if (rl) rl.stop();
            });
    }

    append(logfile) {
        this.files.push(logfile);
    }
}

module.exports = BasicParser;