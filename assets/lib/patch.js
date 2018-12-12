//xxx

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    this.push.apply(this, rest);
    return this;
}

Array.prototype.erase = function(item) {
    for (var i = this.length; i--;) {
        if (this[i] === item) this.splice(i, 1);
    }
    return this;
}