var React = require('react');

var RuleExp = require('../../lib/RuleExp');

class PropCondition extends React.Component {
    constructor(props) {
        super(props);

        this.key = props.idx;
        this.patterns = props.patterns;
        this.condChanged = props.changed;

        var p = this.patterns[0];
        this.expr = p.expr;
        this.op = "==";
        this.cond = '';
    }

    opChange(x, e) {
        this[x] = e.target.value;
        this.condChanged(this.key, this.expr, this.op, this.cond);
    }

    remove() {
        this.condChanged(this.key);
    }

    render() {
        var options = this.patterns.map(p => <option key={p.name} value={p.expr}>{p.name}</option>);
        return(
        <div className="form-group">
            <div className="col-sm-2">
                <select value={this.expr} className="form-control input-sm" 
                onChange={e => this.opChange("expr", e)}>{options}</select>
            </div>
            <div className="col-sm-2">
                <select className="form-control input-sm" value={this.op} onChange={e => this.opChange("op", e)}>
                    <option value="==">=</option>
                    <option value="!=">!=</option>
                    <option value=">">&gt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<">&lt;</option>
                    <option value="<=">&lt;=</option>
                    <option value="not">not</option>
                    <option value="contains">contains</option>
                    <option value="startsWith">startsWith</option>
                    <option value="endsWith">endsWith</option>
                    <option value="matches">matches</option>
                </select>
            </div>
            <div className="col-sm-6">
                <input type="text" value={this.cond} className="form-control input-sm"  onChange={e => this.opChange("cond", e)}/>
            </div>
            <div className="col-sm-2">
                <a className="btn btn-default btn-sm" onClick={e => this.remove()}>
                    <span className="glyphicon glyphicon-minus"></span>
                </a>
            </div>
        </div>
        );
    }
}


class TextMatchBuildForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchTxt: ''
        };

        this.searchTxtChg = this.searchTxtChg.bind(this);
        this.submit = this.submit.bind(this);
    }

    searchTxtChg(e) {
        this.setState({
            searchTxt: e.target.value
        });
        this.props.onStateChange({});
    }

    submit(e) {
        e.preventDefault();
        if(!this.state.searchTxt) {
            alert('search text can not be null or empty...');
            return;
        }
        var rule = new RuleExp.Rule;
        var code = "return JSON.stringify(it).indexOf('" + this.state.searchTxt + "') != -1;";
        var rm = new RuleExp.RuleMeta(code);
        rule.add(rm);

        this.props.onSubmit(rule);
    }

    render() {

        return (
            <div>
                <form className="form-horizontal" onSubmit={this.submit}>
                    <div className="form-group">
                        <div className="col-sm-6">
                            <input type="text" onChange={this.searchTxtChg}
                            className="form-control input-sm" placeholder="Search Text..." />
                        </div>
                        <div className="col-sm-2">
                            <button type="submit" className="btn btn-default btn-sm">Search</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}


class CombinedConditionForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timer: 0
        };
        this.patterns = CombinedConditionForm.genPatterns(props.objTpl);

        this.propConds = [{
            expr: this.patterns[0],
            op: "==",
            cond: ""
        }];

        this.addCond = this.addCond.bind(this);
        this.condChanged = this.condChanged.bind(this);

        this.submit = this.submit.bind(this);
    }

    addCond() {
        this.propConds.push({
            expr: this.patterns[0],
            op: "==",
            cond: ""
        });
        this.updateView();
        this.props.onStateChange({});
    }

    condChanged(idx, expr, op, cond) {
        // delete
        if (arguments.length < 4) {
            this.propConds.splice(idx, 1);
        } else {
            this.propConds[idx] = {
                expr,
                op,
                cond
            };
        }
        this.updateView();
        this.props.onStateChange({});
    }
    
    updateView() {
        this.setState({
            timer: (new Date()).getTime()
        });
    }

    submit(e) {
        e.preventDefault();
        if(!this.propConds.length) {
            alert('at least one condition...');
            return;
        }

        var rule = new RuleExp.Rule;
        this.propConds.forEach(p => {
            if(typeof(p.cond) == 'undefined') p.cond = "";
            var rm = new RuleExp.RuleMeta(p.expr, p.op, p.cond);
            rule.add(rm);
        });

        this.props.onSubmit(rule);
    }


    static genPatterns(objTpl) {

        var patterns = [];
        function pushPattern(obj, superPatt, superName) {
            if (obj instanceof Array) {
                patterns = []
                obj.forEach((v, idx) => {
                    var name = superName + "[" + idx + "]",
                        expr = superPatt + "[" + idx + "]";
                    pushPattern(v, expr, name);
                });
            } else if (obj instanceof Object) {
                var topKeys = Object.keys(obj);
                topKeys.forEach(k => {
                    var name = superName + "." + k,
                        expr = (superPatt || 'it') + "." + k;

                    pushPattern(obj[k], expr, name);
                });
            } else {
                patterns.push({
                    name: superName,
                    expr: superPatt
                });
            }

        }
        pushPattern(objTpl, '', '');
        patterns.forEach(p => {
            p.expr = "{{" + p.expr + "}}";
        });
        return patterns;
    }

    render() {

        var i = 0;
        var pcs = this.propConds.map(pc => {
            var idx = i++;
            return <PropCondition key={idx} idx={idx} patterns={this.patterns} changed={this.condChanged}/>
        });
        return (
            <div>
                <form className="form-horizontal" onSubmit={this.submit}>
                    <div className="form-group">
                        <div className="col-sm-2">
                            <a className="btn btn-warning btn-sm" onClick={this.addCond}>
                                <span className="glyphicon glyphicon-plus"></span>
                            </a>
                        </div>
                        <div className="col-sm-2">
                            <button type="submit" className="btn btn-default btn-sm">{this.props.submitName}</button>
                        </div>
                    </div>
                    {pcs}
                </form>
            </div>
        );
    }

}


class LambdaBuildForm extends React.Component {
    constructor(props) {
        super(props);

        var lambdaTxt = props.initLambda || `var rep = data[0];
return rep.An == 'B-2768' && rep.RepType == 'PO7';`;

        this.state = {
            lambdaTxt: lambdaTxt
        };

        this.lambdaChg = this.lambdaChg.bind(this);
        this.submit = this.submit.bind(this);
    }

    lambdaChg(e) {
        this.setState({
            lambdaTxt: e.target.value
        })
        this.props.onStateChange({});
    }

    submit(e) {
        e.preventDefault();
        if(!this.state.lambdaTxt) {
            alert('lambda code can not be null or empty...');
            return;
        }        var rule = new RuleExp.Rule;
        var code = "var data = it;" + this.state.lambdaTxt;
        var rm = new RuleExp.RuleMeta(code);
        rule.add(rm);

        this.props.onSubmit(rule);
    }

    render() {

        return (
            <div>
                <form className="form-horizontal" onSubmit={this.submit}>
                    <div className="form-group">
                        <div className="col-sm-8">
                            <pre style={{ border: 'none', background: 'inherit', padding: '0 10px'}}>
                            <span className="text-light-blue">
                            function</span>(<var>data</var>) {"{"} <br />
                            <span className="text-green">
                            // `data` is the data of log
                            </span>
                            <textarea className="form-control mono-font" value={this.state.lambdaTxt} rows="5"
                                style={{paddingLeft: '20px'}} onChange={this.lambdaChg}></textarea>
                            {"}"}</pre>
                        </div>
                        <div className="col-sm-2">
                            <button type="submit" className="btn btn-default btn-sm">{this.props.submitName}</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

module.exports = {
    TextMatchBuildForm,
    CombinedConditionForm,
    LambdaBuildForm
};