var SingleLinedParser = require('./SingleLinedParser.js');

class ExLogFileParser extends SingleLinedParser {
    constructor() {
        super(parseLine);
    }
}

var qs = require('querystring');

function parseLine(l) {
    try {
        var msgBody = l.substr('mobile '.length);
        var msgObj = JSON.parse(msgBody);

        var msg = {};
        msg.data = JSON.parse(msgObj.message);
        msg.name = "app-api-log";
        // console.log(msg);
        
        var x = msg.data.requestId;
        var timeStr = x.substr(0,4) + "-" + x.substr(4,2) + "-" + x.substr(6,2) + "T" + x.substr(8,2) + ":" + x.substr(10,2) + ":"  + x.substr(12,2);
        msg.time = new Date(Date.parse(timeStr));

        var url = msg.data.url;

        if(!url || url.indexOf('getPublicKey') == -1) {
            return null;
        }

        var uri = new URL(url);
        var params = qs.decode(uri.search.substr(1));
        Object.assign(msg.data, params);
        return msg;

    } catch (e) {
        console.log(l, e);
    }

}
module.exports = ExLogFileParser;

/*
*/