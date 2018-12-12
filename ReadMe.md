### *LoPa*

LoPa is a analysis tool based on electron, node and react. It arms to be used in almost all data analysis scenes, such as log analysis, sales analysis, etc.

### Build & Run

    npm install 
    npm run build 
    electron .

of cause <a href="https://github.com/electron/electron/releases/tag/v1.4.5" target="_blank"> electron </a> should be installed on your system first.

### How to extend LoPa

LoPa could be extended by creating a `Parser`.

There is a very important thing to be clearify before starting this content.
Typically, a parser may like this:
    
    class ParserBase ... {
        parse() { ... }
        append(logfile) { ... }
        stop() { ... }
    }

Besides, a parser will also equiped with the following events:

    begin-parse: callback(files)        =>  trigger when the parsing begin
    end-parse: callback(files)          =>  trigger when the parsing has been finished
    begin-parse-file: callback(file)    =>  trigger while parsing a file
    end-parse-file: callback(file, log) =>  trigger when finished parsing a ile
    parsing-file: callback(file, progress) =>  trigger when the parsing a file

the meanings of the arguments are as follows:

    callback is a function or a lambda expression
    files is Array<String>
    file is String
    progress is a Number from 0 to 100
    log is a object like {
        dataHolder: {
            'req-log': [{
                name: 'req-log',
                time: new Date,
                data: {}
            }],
            ....
        },
        keys: ['req-log'],
        count: 0
    }

*  `parse()`
    `parse` is the main body of a parser. All the events above should be triggered here.
*  `append(logfile)`
    append the `logfile` for parsing
*  `stop()`
    stop the parsing

Generally, a parser is used like follows:
    
    var parser = new IISLogParser();
    parser.append('./log-2016-11-12.log');
    parser.append('./log-2016-11-13.log');
    parser.append('./log-2016-11-14.log');
    
    parser.on('end-parse-file', (file, log) => {
        // ....
    });
    parser.on('end-parse', (files) => {
        // ...
    });
    
    parser.parse();


---------------------
There are three ways to extend the parser system:

* Extending a parser from `BaseParser`

    This is the basic way to extend a parser, but it's really a fussy work.
    something like this:

        class BasicParser extends ParserBase {
            constructor(parseFn) {
                super();
                this.files = [];
                this.parserCtrl = {};
            }
        
            parse() {
                ...
                self.emit('begin-parse', self.files);
                self.files.forEach(file => {
                    self.emit('begin-parse-file', file);
                    self.parserCtrl[file] = parseX(file, log => {
                        self.emit('end-parse-file', file, log);
                        ...
                        if (filesToBeParsed.length == 0) {
                            self.emit('end-parse', self.files);
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
        
        function parseX(file, parsed, process) {
            ...
            process(100);
        
            ....
            parsed()
        
            return {
                stop: function() {
                    rl.close();
                }
            };
        
        }

* Extending a parser from `BasicParser`

    The `BasicParser` is a sub-class of `ParserBase` with all the methods from `ParserBase` well-defined. The only one thing you need to do is to pass a parser function to `BasicParser`. The parser function is like the `parseX` above.
    code like this:

        class IISLogParser extends BasicParser {
            constructor() {
                super(parse);
            }
        }

        function parse(file, parsedFn, processFn) {
            ...
        }

    the arguments `parsedFn` and `processFn` are callbacks for a file has been parsed and the file is parsing. `parsedFn` has one arguments which is the parsed `log` described above. `processFn` has one arguments which indicates the progress of the parsing in percetage. as follows:

        parse(file, log => {
            ...
        }, pec => {
            console.log(pec + '%');
        });

* The easiest way
    If your log is single-lined in the log file, there is a very way to extend a parser - just define a funtion which processes a single-line string and return a log and then pass the function to the class `SingleLinedParser`
    code like this:
    
        class FocMsgParser extends SingleLinedParser {
            constructor() {
                super(parseLine);
            }
        }

        function parseLine(l) {
            var timeStr = l.substring(l.indexOf('[') + 1, l.indexOf(']') - 1);
            var time = new Date(timeStr);
            var start = l.indexOf(':::');
            if (start == -1) return;
            var msgStr = l.substr(start + 3);
            if (msgStr) {
                try {
                    var msg = JSON.parse(msgStr);
                    msg.time = time;
                    delete msg.args;
                    return msg;
                } catch (e) {
                    console.log(l, e);
                }
            }
        }

enjoy your analysis :-)