var SingleLinedParser = require('./SingleLinedParser.js');

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
            var mo = JSON.parse(msgStr);
            var msg = {};
            msg.time = time;
            msg.data = mo.args;
            return msg;

        } catch (e) {
            console.log(l, e);
        }
    }

}
module.exports = FocMsgParser;

//[2018-05-05 00:00:00.005] [INFO] logInfo - req-log 5:::{"name":"req-log","args":[{"user":"05308","from":"11.12.195.107","target":"11.6.64.36","url":"/mgmt/FltWeather/GetAllNotam","verb":"GET","isAuthorized":true}]}