var fs = require('fs');
const readline = require('readline');

var BasicParser = require('./BasicParser.js');

class IISLogParser extends BasicParser {
    constructor() {
        super(parse);
    }
}

function parse(file, parsed, process) {
    var parsedFn = parsed || function() {};
    var processFn = process || function() {};
    var log = {
        dataHolder: {
            "iis-req-log": []
        },
        keys: ["iis-req-log"],
        count: 0
    };

    var f = fs.statSync(file);

    var totalSize = f.size;
    var procSize = 0;

    var fstream = fs.createReadStream(file);
    const rl = readline.createInterface({
        input: fstream
    });

    var fileds = null;
    var oldPer = 0;
    rl.on('line', l => {
        var b = new Buffer(l);
        procSize += b.length;
        var percent = procSize * 100 / totalSize;

        if (percent - oldPer > 1) {
            processFn(percent);
            oldPer = percent;
        }

        if (l.startsWith('#')) {
            if (l.indexOf('#Fields: ') != -1) {
                fileds = l.replace('#Fields: ', '').trim().split(' ')
                    .map(f => {
                        return String(f).replace(/-\D/g, function(match) {
                            return match.charAt(1).toUpperCase();
                        });
                    })
            }
            return;
        }

        var vars = l.split(' ');
        if (vars.length < 3) return;

        // time 
        var timeStr = vars[0] + " " + vars[1];
        var time = new Date(timeStr);
        // iis log time is UTC
        time = new Date(time.getTime() + 8 * 60 * 60 * 1000);

        try {
            var lx = {};
            lx.time = time;
            if (fileds) {
                lx.data = {};
                fileds.forEach((f, idx) => {
                    lx.data[f] = f == 'timeTaken' ? Number(vars[idx]) : vars[idx];
                });
                delete lx.data.date;
                delete lx.data.time;
                lx.data.time = time.toLocaleString();
            } else {
                lx.data = vars;
            }

            var ll = log.dataHolder["iis-req-log"];
            ll.push(lx);
            log.count++;
        } catch (e) {
            console.log(l, e);
        }
    });

    rl.on('close', e => {
        parsedFn(log);
    });

    return {
        stop: function() {
            rl.close();
        }
    };
}


module.exports = IISLogParser;