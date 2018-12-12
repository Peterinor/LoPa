var React = require('react');

class MassView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="row">
                <a className="btn btn-default btn-sm" onClick={e => this.props.app.go(-1)}>
                    <i className="glyphicon glyphicon-arrow-left"></i>Back
                </a>
                <div className="panel-body mono-font" 
                    style={{height: "500px", overflowY: "auto", wordBreak: "break-all"}}>
                {this.props.massInfo}
                </div>
            </div>
        );
    }
}

module.exports = MassView;