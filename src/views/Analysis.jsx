var React = require('react');

var LogList = require('./LogList');
var SearchLog = require('./SearchLog');
var DistributionForm = require('./DistributionForm');
var Statistics = require('./Statistics');

class Analysis extends React.Component {
    constructor(props) {
        super(props);

        this.app = this.props.app;
        this.logKey = this.props.logKey;
        this.logs = this.app.allLog.dataHolder[this.logKey];

        this.state = {
            page: 1,
            pageSize: 20,
            gap: 1 * 60 * 1000
        };
        this.onGapChange = this.onGapChange.bind(this);
    }

    onGapChange(e) {
        e.preventDefault();
        var sec = Number(e.target.value);
        this.setState({
            gap: 0
        });
        setTimeout(() => {
            this.setState({
                gap: sec * 1000
            });
        }, 100);
    }

    render() {
        var key = this.logKey;

        var data = data = require('../parsers/ParserBase').parseDistrib(this.logs, this.state.gap, 'list');

        var options = [];
        options.push(<option key="60" value="60">1 min</option>);
        for(var i = 5; i <= 60; i += 5) {
            var v = i * 60;
            options.push(<option key={v} value={v}>{i} min</option>);
        };
        options.push(<option key="1" value="1">1 sec</option>);
        for(var x = 5; x < 60; x += 5) {
            options.push(<option key={x} value={x}>{x} sec</option>);
        }

        return (
            <div className="row">
                <a className="btn btn-default btn-sm pull-right" onClick={e => this.app.go(-1)}>
                    <i className="glyphicon glyphicon-arrow-left"></i>Back
                </a>
                <ul className="nav nav-tabs" role="tablist">
                    <li className="active"><a href="#time_dist" role="tab" data-toggle="tab">时间分布</a></li>
                    <li><a href="#all_logs" role="tab" data-toggle="tab">Detail</a></li>
                    <li><a href="#search" role="tab" data-toggle="tab">search</a></li>
                    <li><a href="#statistics" role="tab" data-toggle="tab">统计分析</a></li>
                </ul>
                <div className="tab-content">
                    <div role="tabpanel" className="tab-pane active" id="time_dist">
                        <DistributionForm logs={this.app.allLog.dataHolder[this.logKey]} logKey={this.logKey} />
                    </div>
                    <div role="tabpanel" className="tab-pane" id="all_logs">
                        <LogList logs={this.logs} app={this.app} logKey={this.logKey} />
                    </div>
                    <div role="tabpanel" className="tab-pane" id="search">
                        <SearchLog logs={this.logs} app={this.app} logKey={this.logKey} />
                    </div>
                    <div role="tabpanel" className="tab-pane" id="statistics">
                        <Statistics logs={this.logs} app={this.app} logKey={this.logKey} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = Analysis;