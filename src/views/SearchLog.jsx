var React = require('react');

var LogList = require('./LogList');

const {
    TextMatchBuildForm,
    CombinedConditionForm,
    LambdaBuildForm
} = require('./RuleBuildForm');

var DistributionForm = require('./DistributionForm');

class SearchLog extends React.Component {
    constructor(props) {
        super(props);
       
        this.logKey = props.logKey;
        this.logs = props.logs;
        this.app = props.app;

        this.state = {
            searchType: 'byAll',
            filteredLogs: null,
            timer: 0
        };

        this.typeChange = this.typeChange.bind(this);
        this.ruleChanged = this.ruleChanged.bind(this);
    }

    ruleChanged(rule) {
        this.rule = rule;
        var filteredLogs = null
        var r = this.rule;
        if (r && r.rules.length) {
            filteredLogs = this.logs.filter(l => r.test(l.data).passed);
        }
        this.setState({
            filteredLogs: filteredLogs,
            timer: (new Date()).getTime()
        });
    }

    invalidView() {
        this.setState({
            filteredLogs: null,
            timer: (new Date()).getTime()
        });
    }

    typeChange(e) {
        this.setState({
            searchType: e.target.value
        });
    }

    render() {
        return (
            <div className= "searchForm">
                <div className="form-group">
                    <label>检索方式&nbsp;: &nbsp;&nbsp;
                        <select className="form-control input-sm" value={this.state.searchType} 
                            onChange={this.typeChange}
                            style={{display: 'initial', width: 'auto'}}>
                            <option value="byAll">---- 全文搜索 ----</option>
                            <option value="byProp">---- 条件搜索 ----</option>
                            <option value="byLambda">---- 自定义搜索 ----</option>
                        </select>
                    </label>
                </div>
                <div className="form-container">
                    {this.state.searchType === 'byAll' && 
                        <TextMatchBuildForm submitName="Search" onSubmit={this.ruleChanged} onStateChange={e => this.invalidView()} />
                    }
                    {this.state.searchType === 'byProp' &&
                        <CombinedConditionForm submitName="Search" objTpl={this.logs[0].data} onSubmit={this.ruleChanged} onStateChange={e => this.invalidView()} />
                    }
                    {this.state.searchType === 'byLambda' &&
                        <LambdaBuildForm submitName="Search" onSubmit={this.ruleChanged} onStateChange={e => this.invalidView()} />
                    }
                </div>
                {this.state.filteredLogs && this.state.filteredLogs.length > 0 && 
                <div>
                    <ul className="nav nav-tabs" role="tablist">
                        <li className="active"><a href="#logofsearch" data-toggle="tab">Detail</a></li>
                        {this.state.filteredLogs.length > 20 &&
                        <li><a href="#chartofsearch" data-toggle="tab">Chart</a></li>}
                    </ul>
                    <div className="tab-content">
                        <div role="tabpanel" className="tab-pane active" id="logofsearch">
                            <LogList logs={this.state.filteredLogs} app={this.app} logKey={this.logKey} />
                        </div>
                        {this.state.filteredLogs.length > 20 &&
                        <div role="tabpanel" className="tab-pane" id="chartofsearch">
                            <DistributionForm logs={this.state.filteredLogs} logKey={this.logKey} />
                        </div>}
                    </div>
                </div>
                }
                {this.state.filteredLogs && this.state.filteredLogs.length === 0 && 
                <div className="text-center page-header">
                    <h4>未筛选出符合条件的结果，请确认筛选条件。</h4>
                </div>
                }
            </div>
        );
    }

}

module.exports = SearchLog;