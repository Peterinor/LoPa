var React = require('react');

const {
    ipcRenderer
} = require('electron');

class LogEx extends React.Component {
    constructor(props) {
        super(props);
        this.viewLogExDetail = this.viewLogExDetail.bind(this);
    }

    viewLogExDetail(e) {
        e.preventDefault();
        var logEx = this.props.logEx;
        var route = "#!/view/log/detail/" + logEx.name + "/" + logEx.idx;
        this.props.app.go(route);
    }

    render() {
        var logEx = this.props.logEx;
        var viewEx = this.props.viewEx;
        return (
            <div className="panel panel-default pull-right" style={{position: 'absolute', right: '50px'}}>
                <div className="panel-heading">Log Example</div>
                <div className="panel-body" style={{maxWidth: "400px", overflow: "auto"}}>
                    <p>{logEx.name} / {logEx.idx} / {logEx.data.length / 1000} KB</p>
                    <p className="mono-font">{logEx.time} </p>
                    <div className="mono-font" style={{maxHeight: "300px", wordBreak: 'break-all'}}>
                        {logEx.data.length > 2000 &&
                        <p><a onClick={this.viewLogExDetail} href='#'>view-all</a></p>
                        }
                        {logEx.data.substr(0, Math.min(logEx.data.length, 2000))}
                    </div>
                </div>
                <div className="panel-footer">
                    <div className="btn-group">
                        <button onClick={e => viewEx(logEx.name, logEx.idx - 1, e)} type="button" className="btn btn-default btn-sm">
                            <span className="glyphicon glyphicon-chevron-left"></span>prev
                        </button>
                        <button onClick={e => viewEx(logEx.name, logEx.idx + 1, e)} type="button" className="btn btn-default btn-sm">
                            next<span className="glyphicon glyphicon-chevron-right"></span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

}

class Parsed extends React.Component {
    constructor(props) {
        super(props);

        this.app = props.app;

        this.state = {
            logEx: null,
            files: []
        };
        this.restart = this.restart.bind(this);
    }

    viewEx(key, idx, e) {
        e.preventDefault();

        var allLog = this.app.allLog;
        if (!allLog) return;

        var index = idx % allLog.dataHolder[key].length;
        var l = allLog.dataHolder[key][index];

        this.setState({
            logEx: {
                name: l.name,
                idx: index,
                data: JSON.stringify(l.data),
                time: l.time.toJSON()
            }
        });
    }

    analysisLog(key, e) {
        e.preventDefault();
        var rt = "#!/analysis/" + key;
        this.app.go(rt);
    }

    restart(e) {
        e.preventDefault();
        if (confirm('后退将清空所有日志，确认继续？')) {
            this.app.reset();
            this.app.go('/');
        }
    }

    render() {
        if(!this.app.allLog) {
            setTimeout(() => this.app.go('/'), 500);
            return (<div />);  
        } 
        var fileList = this.app.allParsedFils.map(f => <span key={f.name}>{f.name} | </span>);
        var logList = this.app.allLog.keys.sort((a, b) => { 
            return b.toLowerCase() > a.toLowerCase() ? -1 : 1;
        }).map(k => {
            return (
                <li key={k}>
                    {k}&nbsp;
                    - <a href="#" onClick={e => this.viewEx(k, 0, e)}>{this.app.allLog.dataHolder[k].length} 条</a>&nbsp;
                    <a href="#" onClick={e => this.analysisLog(k, e)}>analysis</a>
                </li>
            );
        });
        var logEx = this.state.logEx;
        return (
            <div className="row">
                <div className="pull-right" style={{paddingBottom: '5px'}}>
                    <a href="#/" onClick={this.restart} className="btn btn-default btn-sm">
                        <i className="glyphicon glyphicon-arrow-left"></i>Back
                    </a>
                </div>
                <br />
                <div style={{clear: 'both'}}>
                    {logEx && <LogEx logEx={logEx} viewEx={this.viewEx.bind(this)} app={this.props.app} /> }
                    <ul>
                        <li>
                            文件：{fileList}
                        </li>
                        <li>分析日志文件{this.app.files.length}个，解析日志 {this.app.allLog.count} 条</li>
                        <li>日志分 {this.app.allLog.keys.length} 类
                            <ul>
                            {logList}
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

module.exports = Parsed;