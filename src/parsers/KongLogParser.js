var SingleLinedParser = require('./SingleLinedParser.js');

class KongLogParser extends SingleLinedParser {
    constructor() {
        super(parseLine);
    }
}


function parseLine(l) {

    try {

        var log = JSON.parse(l);
        var time = new Date(log.started_at);

        var msg = {};
        msg.time = time;
        msg.data = {
            consumer: log.consumer || {},
            request: log.request || {},
            client: log.client_ip
        };

        msg.data.request.apiname = log.api.name;

        return msg;

    } catch (e) {
        console.log(l, e);
    }

}
module.exports = KongLogParser;


/*
{
    "consumer": {
        "custom_id": "FOC_00000000000000000000",
        "created_at": 1522721189000,
        "username": "FOC",
        "id": "3fd5d67c-b72f-4b6d-b83b-f55ff5ec1d56"
    },
    "api": {
        "created_at": 1519485834641,
        "strip_uri": false,
        "id": "690db1dc-4c2c-47e6-8187-40e01d3bc761",
        "name": "Navi~Route-Airway-Airport",
        "methods": [
            "GET",
            "HEAD"
        ],
        "http_if_terminated": true,
        "https_only": false,
        "upstream_url": "http:\/\/ais-upstream",
        "uris": [
            "\/route",
            "\/airway",
            "\/airport",
            "\/routeoverview"
        ],
        "preserve_host": false,
        "upstream_connect_timeout": 60000,
        "upstream_read_timeout": 60000,
        "upstream_send_timeout": 60000,
        "retries": 5
    },
    "request": {
        "querystring": {
            "carrier": "MF",
            "actype": "B737-700GY"
        },
        "size": "139",
        "uri": "\/y?q=z",
        "url": "http:\/\/u.x.com:80\/y?q=z",
        "headers": {
            "host": "u.x.com",
            "x-consumer-username": "FOC",
            "apikey": "10aPc0NpFnlxWKbL6FFYKUE86DAHbC12",
            "x-consumer-id": "3fd5d67c-b72f-4b6d-b83b-f55ff5ec1d56",
            "x-consumer-custom-id": "FOC_00000000000000000000"
        },
        "method": "GET"
    },
    "client_ip": "11.6.64.10",
    "latencies": {
        "request": 123,
        "kong": 0,
        "proxy": 123
    },
    "authenticated_entity": {
        "consumer_id": "3fd5d67c-b72f-4b6d-b83b-f55ff5ec1d56",
        "id": "d61781e8-d988-4f2a-9f7b-6923442cc8c6"
    },
    "upstream_uri": "\/airport\/ZSAM\/altns?carrier=MF&actype=B737-700GY",
    "response": {
        "headers": {
            "content-type": "application\/json; charset=utf-8",
            "date": "Sat, 04 Aug 2018 10:41:38 GMT",
            "x-powered-by": "ASP.NET",
            "connection": "close",
            "via": "kong\/0.12.3",
            "cache-control": "no-cache",
            "content-length": "754",
            "pragma": "no-cache",
            "server": "Microsoft-IIS\/8.5",
            "x-kong-proxy-latency": "0",
            "x-kong-upstream-latency": "123",
            "x-aspnet-version": "4.0.30319",
            "expires": "-1"
        },
        "status": 200,
        "size": "1110"
    },
    "tries": [
        {
            "balancer_latency": 0,
            "port": 8001,
            "ip": "11.6.48.71"
        }
    ],
    "started_at": 1533445351643
}

*/