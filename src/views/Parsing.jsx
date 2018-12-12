var React = require('react');
var ReactDOM = require('react-dom');

var Progress = require('./Progress');

class Parsing extends React.Component {
    constructor(props) {
        super(props);

        var app = props.app;

        this.state = {
            progress: 0,
            files: []
        };

        this.stop = this.stop.bind(this);
    }

    componentDidMount() {
        var self = this;
        app.on('end-parse', files => {
            self.setState({
                progress: 100
            });
            app.go('/parsed');
        });
        app.on('parsing-file', (file, pec) => {
            self.setState({
                progress: pec,
                files: self.props.app.files
            });
        });
    }

    componentWillUnmount() {
        this.props.app.removeAllListeners('end-parse');
        this.props.app.removeAllListeners('parsing-file');
    }

    stop() {
        this.props.app.stop();
    }

    render() {
        var detailProgress = this.state.files.map(f => {
            return (
                <div key={f.name}>
                    <p>{f.name}</p>
                    <Progress progress={f.percent} type="success" />
                </div>
            );
        });
        return (
            <div className="row">
                <div className="process-container">
                    总进度：
                    <Progress progress={this.state.progress} type="warning" />
                    {detailProgress}
                </div>
                <br />
                <button onClick={this.stop} className="btn btn-danger btn-block btn-sm">stop</button>
            </div>
        );
    }
}

module.exports = Parsing;