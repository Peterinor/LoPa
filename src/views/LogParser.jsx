var React = require('react');

// var OptionsForm = require('./OptionsForm');
class LogParser extends React.Component {
    constructor(props) {
        super(props);

        this.app = props.app;
    }

    render() {
        return (
            <div className="row">
                <div id="holder">
                    Drag your log file here to start a parsing
                </div>
            </div>
        );
    }
}

module.exports = LogParser;