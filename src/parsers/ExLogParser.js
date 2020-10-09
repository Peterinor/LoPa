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
"@timestamp",message,ip
"Oct 8, 2020 @ 21:20:58.462","mobile {""division"":""ds"",""log_topic"":""ds-log"",""log_level"":""INFO"",""appName"":""mobileapi_9001_mobile-starter"",""dmAppName"":""厦航E鹭飞接口"",""message"":""{\""ip\"":\""112.96.97.69\"",\""plat\"":\""APP\"",\""module\"":\""authmode\"",\""option\"":\""END\"",\""httpMethod\"":\""GET\"",\""url\"":\""http://mobileapi.xiamenair.com/mobile-starter/api/v1/Authmode/getPublicKey?deviceId=71BB7A6EED5EAEC6B0B5B71570B91371&loginId=13860149672\"",\""result\"":\""-\"",\""timeUsed\"":2,\""requestId\"":\""20201008212057638938\"",\""jid\"":\""guest\""}""}","11.8.200.176"
"Oct 8, 2020 @ 21:20:58.462","mobile {""division"":""ds"",""log_topic"":""ds-log"",""log_level"":""INFO"",""appName"":""mobileapi_9001_mobile-starter"",""dmAppName"":""厦航E鹭飞接口"",""message"":""{\""ip\"":\""112.96.97.69\"",\""plat\"":\""APP\"",\""module\"":\""authmode\"",\""option\"":\""START\"",\""httpMethod\"":\""GET\"",\""url\"":\""http://mobileapi.xiamenair.com/mobile-starter/api/v1/Authmode/getPublicKey?deviceId=71BB7A6EED5EAEC6B0B5B71570B91371&loginId=13860149672\"",\""result\"":\""-\"",\""timeUsed\"":1,\""requestId\"":\""20201008212057638938\"",\""jid\"":\""guest\""}""}","11.8.200.176"
"Oct 8, 2020 @ 21:20:48.397","mobile {""division"":""ds"",""log_topic"":""ds-log"",""log_level"":""INFO"",""appName"":""mobileapi_9001_mobile-starter"",""dmAppName"":""厦航E鹭飞接口"",""message"":""{\""ip\"":\""112.96.97.69\"",\""plat\"":\""APP\"",\""module\"":\""authmode\"",\""option\"":\""START\"",\""httpMethod\"":\""GET\"",\""url\"":\""http://mobileapi.xiamenair.com/mobile-starter/api/v1/Authmode/getPublicKey?deviceId=71BB7A6EED5EAEC6B0B5B71570B91371&loginId=13860149672\"",\""result\"":\""-\"",\""timeUsed\"":0,\""requestId\"":\""20201008212047757529\"",\""jid\"":\""guest\""}""}","11.8.200.174"
*/