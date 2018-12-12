var React = require('react');
var ReactDOM = require('react-dom');

class Progress extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var p = this.props.progress;
        var proClass = "progress-bar progress-bar-" + this.props.type;
        return (
            <div className="progress">
                <div className={proClass} role="progressbar" 
                    aria-valuemin="0" aria-valuemax="100" style={{width: p + '%'}}> 
                    {p}%
                </div>
            </div>
        );
    }
}

module.exports = Progress;