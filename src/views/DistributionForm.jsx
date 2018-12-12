var React = require('react');

var DistributionChart = require('./DistributionChart');

class DistributionForm extends React.Component {
    constructor(props) {
        super(props);

        this.logs = this.props.logs;
        this.logKey = this.props.logKey;

        this.state = {
            gap: 60
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
                gap: sec
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
            <div className="form-group">
            <label>
                分布间隔 : 
                <select className="form-control input-sm" onChange={this.onGapChange}
                    style={{display: 'initial', width: 'auto'}}>
                    {options}
                </select>
            </label>
            {this.state.gap != 0 &&
                <DistributionChart logKey={key} data={data} />
            }
            </div>
        );
    }
}

module.exports = DistributionForm;