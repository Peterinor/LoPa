var React = require('react');

var md5 = require('../../lib/md5.js');

class LogList extends React.Component {
    constructor(props) {
        super(props);
       
        this.logKey = props.logKey;
        this.logs = props.logs;
        this.app = props.app;

        this.state = {
            page: 1,
            pageSize: 20
        };
    }

    goToPage(page, e) {
        e.preventDefault();
        var maxPage = Math.floor(this.logs.length / this.state.pageSize) + 1;
        if(page == -1) {
            page = maxPage;
        }
        this.setState({
            page: Math.min(page, maxPage)
        });
    }
    render() {
        var logs = this.logs;
        var idx = 1;
        var logToShow = [];

        var startIndex = this.state.pageSize * (this.state.page - 1);
        for(var i = startIndex; i < Math.min(startIndex + this.state.pageSize, logs.length); i++) {
            logToShow.push(logs[i]);
        }
        var idx = startIndex;
        var lgs = logToShow.map(l => {
            var time = l.time.toLocaleString();
            var cnt = JSON.stringify(l.data);
            var over = cnt.length > 500;
            var disp = cnt.substr(0, over ? 500 : cnt.length);
            idx++;
            return (
                <tr key={md5(time + cnt + idx)}>
                    <td>{idx}</td>
                    <td>{time}</td>
                    <td>{disp}</td>
                    <td>{over && <a className="viewDetail" href="#" 
                        onClick={e => {e.preventDefault(); this.app.go("#!/view/log/detail/" + this.logKey + "/" + idx)}}>
                        detail</a>}
                    </td>
                </tr>
            );
        });
        var maxPage = Math.floor(this.logs.length / this.state.pageSize) + 1;
        var page = this.state.page;
        var sp = 1,
            ep = maxPage;

        // more that 7 pages
        var moreThan7Pages = maxPage > 7;
        if(moreThan7Pages) {
            sp = Math.max(sp, page - 3);
            ep = Math.min(ep, sp + 6);
        }
        var pages = [];
        for(var i = sp; i < ep + 1; i++) {
            pages.push(i)
        }

        var pageList = pages.map(p => <li key={"page_" + p}><a href="#" onClick={e => this.goToPage(p, e)}>{p}</a></li>)
        return (
            <div>
                <table className="table mono-font">
                    <caption>Total: {logs.length}</caption>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th style={{minWidth: '200px'}}>time</th>
                            <th>content</th>
                            <th style={{minWidth: '80px'}}>##</th>
                        </tr>
                    </thead>
                    <tbody>
                    {lgs}
                    </tbody>
                </table>
                {maxPage > 1 &&
                <nav style={{textAlign: "center"}}>
                    <ul className="pager">
                        {this.state.page > 1 && 
                            <li className="previous"><a href="#" onClick={e => this.goToPage(this.state.page - 1, e)}>&larr; prev</a></li>
                        }
                        {moreThan7Pages && <li key="page_1" ><a href="#" onClick={e => this.goToPage(1, e)}>&laquo;</a></li>}
                        {pageList}
                        {moreThan7Pages && <li key="page__1"><a href="#" onClick={e => this.goToPage(-1, e)}>&raquo;</a></li>}                            
                        {this.state.page < maxPage && 
                            <li className="next"><a href="#" onClick={e => this.goToPage(this.state.page + 1, e)}>next &rarr;</a></li>
                        }
                    </ul>
                </nav>
                }
            </div>
        );
    }

}

module.exports = LogList;