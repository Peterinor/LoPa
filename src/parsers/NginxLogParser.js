var SingleLinedParser = require('./SingleLinedParser.js');

class NginxLogParser extends SingleLinedParser {
    constructor() {
        super(parseLine);
    }
}


function parseLine(l) {

    try {
        var rDate = /\[(.*?):(\d+:\d+:\d+) (\+\d+)].*?"(\w+)\s+(\/\S*)\s+HTTP\/.*?"\s+(\d+)\s+(\d+)/;
        var rr = rDate.exec(l);
        if (rr) {
            var timeStr = rr[1] + ' ' + rr[2] + rr[3];
            var time = new Date(Date.parse(timeStr));

            var msg = {};
            msg.time = time;
            msg.data = {
                verb: rr[4],
                url: rr[5],
                status: rr[6],
                timeTaken: rr[7]
            };


            return msg;
        }

    } catch (e) {
        console.log(l, e);
    }

}
module.exports = NginxLogParser;


// 11.13.49.50 - - [03/May/2017:09:03:07 +0800] "GET /gb.jpg HTTP/1.1" 400 334 "-" "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET4.0C; .NET4.0E)"