var SingleLinedParser = require('./SingleLinedParser.js');

class ExLogParser extends SingleLinedParser {
    constructor() {
        super(parseLine);
    }
}

var qs = require('querystring');

function parseLine(l) {
    try {
        var msgReg = /""\{.*?\}""/;
        var rr = msgReg.exec(l);
        if (rr) {
            var timeStr = l.split('","')[0];
            var msgBody = rr[0];
            msgBody = msgBody.replace(/""/g, '"');
            var msg = {};
            msg.time = new Date(Date.parse(timeStr));
            msg.data = JSON.parse(JSON.parse(msgBody));
            msg.name = "eslog";
            // console.log(msg);

            var url = msg.data.url;
            var uri =  new URL(url);
            var params = qs.decode(uri.search.substr(1));
            Object.assign(msg.data, params);
            return msg;
        }

    } catch (e) {
        console.log(l, e);
    }

}
module.exports = ExLogParser;

/*
*/