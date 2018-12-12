var fs = require('fs');
const readline = require('readline');

var BasicParser = require('./BasicParser.js');

var $ = require('../../lib/jQuery');

class FlightParser extends BasicParser {
    constructor() {
        super(parse);
    }
}

function parse(file, parsed, process) {
    var parsedFn = parsed || function() {};
    var processFn = process || function() {};
    var log = {
        dataHolder: {
            "flights": []
        },
        keys: ["flights"],
        count: 0
    };

    var stopped = false;
    var ajx = null;
    var flog = log.dataHolder["flights"];
    fs.readFile(file, (err, data) => {

        if (err) {
            processFn(100);
            parsedFn(log);
        }

        var str = data.toString();
        var date = str.split('\n');
        var dateList = [];
        var oneDay = 24 * 60 * 60 * 1000;
        date.forEach(d => {
            if (d.indexOf('~') != -1) {
                var ds = d.split('~');
                var start = new Date(ds[0].trim());
                var end = new Date(ds[1].trim());
                var edt = end.getTime();
                var sdt = start.getTime()
                for (var dt = sdt; dt <= edt; dt += oneDay) {
                    var xdt = new Date(dt);
                    dateList.push(xdt.getFullYear() + "-" + (xdt.getMonth() + 1) + "-" + xdt.getDate());
                }
            } else {
                if (dateList.indexOf(d) == -1) dateList.push(d);
            }
        });

        var today = new Date();
        var i = 0;

        function fetch(dt) {
            if (!dt || stopped) {
                processFn(100);
                parsedFn(log);
                return;
            }
            var pec = Math.round(10000 * i / dateList.length) / 100;
            processFn(pec);
            // /Mgmt/Flight/GetSimpleFlights
            var url = "http://{{flight-server}}/";
            $.ajax({
                url: url,
                headers: {
                    'APIKey': 'be562f49d97f46a3a19c364b6db9cc9c'
                },
                method: 'GET',
                dataType: 'json',
                data: jQuery.param({
                    fltdate: dt.trim()
                })
            }).done(function(flights) {
                if (stopped) return;
                if (flights) {
                    flights.forEach(f => {
                        var depa = new Date(f.Atd || f.Etd || f.Std);
                        depa.setDate(1);
                        depa.setMonth(0);
                        var l = {
                            time: depa,
                            data: f
                        };
                        flog.push(l);
                        log.count++;
                    });
                }
                fetch(dateList[i++]);
            }).fail(function() {
                fetch(dateList[i++]);
            });
        }
        fetch(dateList[i++]);
    });

    return {
        stop: function() {
            stopped = true;
            if (ajx) ajx.abort();

            processFn(100);
            parsedFn(log);
        }
    };
}


module.exports = FlightParser;