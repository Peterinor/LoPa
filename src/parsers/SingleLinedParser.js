var fs = require('fs');
const readline = require('readline');

var BasicParser = require('./BasicParser.js');

class SingleLinedParser extends BasicParser {
    constructor(parseLine) {
        super(getParseFn(parseLine));
    }
}

function getParseFn(parseLine) {

    return function parse(file, parsed, process) {
        var parsedFn = parsed || function() {};
        var processFn = process || function() {};
        var log = {
            dataHolder: {},
            keys: [],
            count: 0
        };

        var f = fs.statSync(file);

        var totalSize = f.size;
        var procSize = 0;

        var fstream = fs.createReadStream(file);
        const rl = readline.createInterface({
            input: fstream
        });

        var oldPer = 0;
        rl.on('line', l => {
            var b = new Buffer(l);
            procSize += b.length;
            var percent = procSize * 100 / totalSize;

            if (percent - oldPer > 1) {
                processFn(percent);
                oldPer = percent;
            }

            var lx = parseLine(l);
            if (!lx) return;
            var lh = log.dataHolder[lx.name];
            if (!lh) {
                lh = log.dataHolder[lx.name] = [];
                log.keys.push(lx.name);
            }
            lh.push(lx);
            log.count++;
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

}

module.exports = SingleLinedParser;