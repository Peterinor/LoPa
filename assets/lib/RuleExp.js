var RE = {};

RE.comparisons = {
    equal: function(x, y) {
        return x == y;
    },
    notEqual: function(x, y) {
        return x != y;
    },
    strictEqual: function(x, y) {
        return x === y;
    },
    strictNotEqual: function(x, y) {
        return x !== y;
    },
    greater: function(x, y) {
        return x > y;
    },
    notGreater: function(x, y) {
        return x <= y;
    },
    less: function(x, y) {
        return x < y;
    },
    notLess: function(x, y) {
        return x >= y;
    },
    contains: function(x, y) {
        if (_isArray(x)) {
            return this.filters(x, y);
        } else if (_isString(x)) {
            return x.indexOf(y) != -1;
        } else {
            throw "Ivalid arguments!";
        }
    },
    startsWith: function(x, y) {
        return x.indexOf(y) === 0;
    },
    endsWith: function(x, y) {
        var reg = new RegExp(y + '$', 'g');
        return reg.test(x);
    },
    matches: function(x, y) {
        var reg = new RegExp(y);
        return reg.test(x);
    },
    //collection
    filters: function(x, y) {
        if (y._className == 'RuleMeta') {
            for (var i = 0; i < x.length; i++) {
                var _x = x[i];
                if (y.test(_x)) {
                    return true;
                }
            }
            return false;
        } else {
            var keys = [];
            for (var key in y) {
                if (y.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            for (var i = 0; i < x.length; i++) {
                var _x = x[i];
                var matched = true;
                for (var j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    matched = matched && (_x[key] == y[key]);
                }
                if (matched) {
                    return true;
                }
            }
            return false;
        }
    },
    //nested rule, y is a rule here
    matchesRule: function(x, y) {
        return y.test(x);
    },
    //
    not: function(x) {
        return !x;
    }
}

RE.compileSettings = {
    evaluate: /\{\{([\s\S]+?)\}\}/, //match only once !!!
    matcher: /\{\{([\s\S]+?)\}\}|$/g,
    varName: 'it',
    operators: '>,<,>=,<=,!=,===,!,',
    unaryOperators: '!,not,'
};

var toString = Object.prototype.toString;
var _isObject = function(obj) {
    return toString.call(obj) == '[object Object]';
}
var _isArray = function(obj) {
    return toString.call(obj) == '[object Array]';
}
var _isString = function(obj) {
    return toString.call(obj) == '[object String]';
}
var _isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
}

/**
 * left & operator is required but right and description is optional
 */
var RuleMeta = function(left, operator, right, description) {
    if (arguments.length == 0) {
        throw "RuleMeta need at least one arguments to initialize!";
    }
    if (arguments.length >= 3) {
        this.left = left;
        this.operator = operator;
        this.right = right;
        this.description = description || '';
        init.call(this);
    } else if (arguments.length == 2) {
        //args: left, operator, description
        if (operator in RE.comparisons || RE.compileSettings.operators.indexOf(operator + ',') != -1) {
            this.left = left;
            this.operator = operator;
            this.description = '';
        } else {
            //args: operator, description
            this.operator = left;
            this.description = description;
        }
        this.right = null;
        init.call(this);

    } else {
        if (_isObject(left)) {
            var rule = left;
            this.left = rule.left;
            this.operator = rule.operator;
            this.right = rule.right || null;
            this.description = rule.description || '';
            if (!this.operator) {
                this.operator = this.left;
                this.left = null;
            }
            init.call(this);
        } else {
            //String,Function
            this.operator = left;
            this.left = this.right = null;
            this.description = '';

            if (_isFunction(this.operator)) {
                var that = this;
                this.exec = function(it) {
                    return that.operator.call(it, it);
                }
            }
            if (_isString(this.operator)) {
                var text = this.operator;
                if (text.toLowerCase().indexOf('return') == -1) {
                    text = 'return ' + text + ';';
                }
                this.text = text;
                this.exec = this.compile(this.text);
            }
        }
    }

    this.test = function() {
        var that = this;
        return function(it) {
            return that.exec.call(it, it, that.left, that.right, RE.comparisons);
        }
    }.call(this);

    function init() {
        var _left = 'left',
            _right = 'right';
        if (RE.compileSettings.evaluate.test(this.left)) {
            _left = this.left;
        }
        var operator = this.operator;
        if (_isString(this.right) && RE.compileSettings.evaluate.test(this.right)) {
            _right = this.right;
        }
        if (RE.compileSettings.operators.indexOf(operator + ',') != -1) {
            //not unary operator with just one operand
            if (RE.compileSettings.unaryOperators.indexOf(operator + ',') != -1) {
                this.text = 'return ' + operator + ' ' + _left + ";";
            } else {
                this.text = 'return ' + _left + ' ' + operator + ' ' + _right + ";";
            }
        } else if (operator in RE.comparisons) {
            this.text = 'return ' + 'comparisons["' + operator + '"](' + _left + ',' + _right + ');';
        } else {
            throw "the operator " + operator + " is not supported!";
        }
        this.exec = this.compile(this.text);
    }
}

RuleMeta.prototype._className = "RuleMeta";
RuleMeta.prototype.compile = function(text) {
    var exec;
    var settings = RE.compileSettings
    var varName = (settings.varName || 'it');

    // Combine delimiters into one regular expression via alternation.
    var matcher = RE.compileSettings.matcher;

    // Compile the exec source, escaping string literals appropriately.
    var index = 0;
    var source = "";
    text.replace(matcher, function(match, evaluate, offset) {
        source += text.slice(index, offset);
        if (evaluate) {
            if (evaluate.startsWith('it')) {
                source += (evaluate + "");
            } else {
                if (evaluate.startsWith('[')) {
                    source += varName + evaluate + "";
                } else {
                    source += varName + "." + evaluate + "";
                }
            }
        }
        index = offset + match.length;
        return match;
    });
    try {
        exec = new Function(varName, 'left', 'right', 'comparisons', source);
        exec.source = 'function(' + varName + ',left,right){\n' + source + '}';
        return exec;
    } catch (e) {
        e.source = source;
        throw e;
    }
    return new Function();
}


var RELATION = {
    And: 0,
    Or: 1
};

/**
 * options like {passed:function(){}, failed:function(){}}
 */
var Rule = function(options) {
    this.rules = [];
    this.options = options || {};
    this.relation = RELATION.And;
    if ("relation" in this.options) {
        this.relation = this.options.relation;
    }
}
Rule.RELATION = RELATION;

Rule.prototype._className = "Rule";

Rule.prototype.add = function(rulemeta) {
    this.rules.push(rulemeta);
}

Rule.prototype.test = function(it) {
    var test = {
        passed: true,
        failures: [],
        results: null
    };
    var results = {};
    switch (this.relation) {
        case RELATION.Or:
            test.passed = false;
            for (var i = 0; i < this.rules.length; i++) {
                var passed = this.rules[i].test(it);
                if (!passed) test.failures.push(this.rules[i]);
                test.passed = test.passed || passed;
                //passed
                if (test.passed) {
                    break;
                }
            }
            if (!test.passed) {
                return test;
            }
            break;
        case RELATION.And:
        default:
            for (var i = 0; i < this.rules.length; i++) {
                test.passed = test.passed && this.rules[i].test(it);
                //failed
                if (!test.passed) {
                    test.failures.push(this.rules[i]);
                    !_isFunction(this.options.failed) || this.options.failed(it);
                    return test;
                }
            }
            break;
    }

    if (this.options.results) {
        var exps = this.options.results;
        for (var exp in exps) {
            var _exp = exps[exp];
            var r = new RuleMeta("return " + _exp + ";");
            results[exp] = r.test(it);
        }
    }
    test.passed = true;
    test.results = results;
    !_isFunction(this.options.passed) || this.options.passed(it);
    return test;
}

RE.RuleMeta = RuleMeta;
RE.Rule = Rule;
module.exports = RE;