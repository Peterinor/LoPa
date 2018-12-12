var React = require('react');

var Highcharts = require('highcharts');
Highcharts.setOptions(require('../highchart.theme.js').theme);
Highcharts.setOptions({
    global: {
        useUTC: false
    }
});

class DistributionChart extends React.Component {
    constructor(props) {
        super(props);

        this.data = props.data;
        this.logKey = props.logKey;

        this.chart = null;

        this.id = "chart_container_" + (new Date()).getTime();
    }

    render() {
        return (
            <div id={this.id} style={{minWidth: '700px', width: '100%', margin: '0 auto', height: '500px'}}></div>
        );
    }

    componentDidMount() {

        this.chart = Highcharts.chart(this.id, {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: this.logKey + ' distribution in time'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                    'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Counts'
                }
            },
            tooltip: {
                headerFormat: '<b>{series.name}</b><br>',
                pointFormat: '{point.x:%H:%M} | {point.y:.0f}'
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
                name: 'Log Distribution',
                type: 'area',
                data: this.data.data
            },{
                name: 'Avg',
                data: this.data.avg
            }/*,{
                name: 'Maximum',
                data: this.data.max
            }*/]
        });
    }

    componentWillUnmount() {
        if(this.chart) this.chart.destroy();
    }
}

module.exports = DistributionChart;