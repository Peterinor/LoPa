const EventEmitter = require('events');
// import EventEmitter from 'events';

/*
 * timeDistInterval: 
 */

class ParserBase extends EventEmitter {
    constructor() {
        super();
    }

    /*
     * parse the log files 
     events:
        begin-parse: callback(files)
        end-parse: callback(files)
        begin-parse-file: callback(file)
        end-parse-file: callback(file, log)
        parsing-file: callback(file, progress)
        --------------
        callback is a function or a lambda expression
        files is Array<String>
        file is string
        progress is a Number
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
     */
    parse() {}

    // stop the parsing 
    stop() {}

    // append logfile for parsing
    append(logfile) {}

    static parseDistrib(logs, gap, returnType) {
        var dataMap = {};
        var gap = (gap || 60) * 1000; // 1 min default
        logs.forEach(l => {
            var tx = Math.floor(l.time.getTime() / gap) * gap;
            if (!dataMap.hasOwnProperty(tx)) dataMap[tx] = 0;
            dataMap[tx]++;
        });
        var dataMapKeys = Object.keys(dataMap);
        var minDate = Math.min.apply(Math, dataMapKeys);
        var maxDate = Math.max.apply(Math, dataMapKeys);

        var total = 0;
        var minValue = 10000000000,
            maxValue = -1;
        dataMapKeys.forEach(k => {
            var v = dataMap[k];
            if(v > maxValue) maxValue = v;
            if(v < minValue) minValue = v;
            total += v;
        });
        var avgValue = Math.floor(total / dataMapKeys.length);
        var avg = [minDate, maxDate].map(d => [d, avgValue]);
        var max = [minDate, maxDate].map(d => [d, maxValue]);
        var min = [minDate, maxDate].map(d => [d, minValue]);
        // for(var dt = minDate; dt < maxDate; dt += gap) {
        //     if (!dataMap.hasOwnProperty(dt)) dataMap[dt] = 0;
        // }

        returnType = returnType || 'map';
        if (returnType == 'map') return dataMap;

        // array
        var data = dataMapKeys.map(k => {
            return [Number(k), dataMap[k]];
        }).sort((a, b) => {
            return a[0] - b[0];
        });
        return {
            data: data,
            avg: avg,
            min: min,
            max: max
        };
    }
}

module.exports = ParserBase;