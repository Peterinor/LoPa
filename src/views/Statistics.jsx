var React = require('react');
var ReactDOM = require('react-dom');

var Highcharts = require('highcharts');
Highcharts.setOptions(require('../highchart.theme.js').theme);
Highcharts.setOptions({
    global: {
        useUTC: false
    }
});

class Statistics extends React.Component {

    constructor(props) {
        super(props);

        this.logs = props.logs;
        this.logKey = props.logKey;

        this.chart = null;

        this.groupKey = null;
        this.groupRegex = null;
        this.excludeRegex = null;
        this.moreThan = 5;

        this.id = "stat_chart_container_" + (new Date()).getTime();
    }

    render() {
        return (
            <div>
                <div className="form-horizontal">
                    <div className="form-group">
                        <input
                            className="form-control input-sm mono-font"
                            placeholder="Key"
                            onChange={(e) => this.groupKey = e.target.value}
                            onKeyPress={(e) => {
                                if (e.charCode === 13) this._stat();
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="form-control input-sm mono-font"
                            placeholder="Group Regex: Identity function by default"
                            onChange={(e) => this.groupRegex = e.target.value}
                            onKeyPress={(e) => {
                                if (e.charCode === 13) this._stat();
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="form-control input-sm mono-font"
                            placeholder="Exclude Regex"
                            onChange={(e) => this.excludeRegex = e.target.value}
                            onKeyPress={(e) => {
                                if (e.charCode === 13) this._stat();
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="form-control input-sm mono-font"
                            type="number"
                            placeholder="count more than... (default 5)"
                            onChange={(e) => this.moreThan = e.target.value}
                            onKeyPress={(e) => {
                                if (e.charCode === 13) this._stat();
                            }}
                        />
                    </div>
                </div>
                <div id={this.id} style={{minWidth: '700px', width: '100%', margin: '0 auto', height: '500px'}}></div>
            </div>
        );
    }

    _stat() {
        // TODO: check null
        var groupTrans = this.groupRegex ? (x) => {
            var r = RegExp(this.groupRegex);
            var ret = r.exec(x);
            return ret && ret[0];
        } : (x) => x;
        var testExclude = this.excludeRegex ? (x) => {
            var r = RegExp(this.excludeRegex);
            return r.test(x);
        } : (x) => false;
        var buckets = {};
        var xs = [];
        if (this.groupKey) {
            this.logs.forEach((item) => {
                var originX = item.data[this.groupKey];
                var x = groupTrans(originX);
                var ex = testExclude(originX);
                if (x && !ex) {
                    if (xs.indexOf(x) < 0) {
                        xs.push(x);
                    }
                    if (buckets[x]) {
                        buckets[x].push(item);
                    } else {
                        buckets[x] = [item]
                    }
                }
            });
            xs.sort((x1, x2) => - (buckets[x1].length - buckets[x2].length));
            var data = xs.map((x) => [x, buckets[x].length]).filter(q => q[1] >= this.moreThan);
            console.log(data.map(d => d[0]).join(','));
            this._renderChart(data);
        }
    }

    _renderChart(data) {

        this.chart = Highcharts.chart(this.id, {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: this.logKey + ' statistics'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                    'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
            },
            xAxis: {
                categories: data.map((e) => e[0])
            },
            yAxis: {
                title: {
                    text: 'Log Counts'
                }
            },
            tooltip: {
                headerFormat: '<b>{point.key}</b><br>',
                pointFormat: '{point.y:.0f}'
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [{
                type: 'area',
                name: 'Statistics',
                data: data
            }]
        });
    }

    componentWillUnmount() {
        if(this.chart) this.chart.destroy();
    }

}

module.exports = Statistics;
