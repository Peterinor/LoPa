const {
    ipcRenderer
} = require('electron');


document.querySelectorAll('a[data-cmd]').forEach(function(a) {
    a.addEventListener('click', function(e) {
        e.preventDefault();
        var cmd = this.attributes['data-cmd'].value;
        ipcRenderer.send(cmd);
        return false;
    });
});


window.onunload = function() {
    return false;
}

window.onresize = function() {
    var $root = document.getElementById('root');
    var rh = window.innerHeight - 55 - 20;
    $root.style.height = rh + 'px';

}

window.onload = function() {
    window.onresize();
}


document.getElementById('#sys_info');
var memEl = {};
document.querySelectorAll('#sys_info span[data-memtype]').forEach(function(el) {
    var t = el.attributes['data-memtype'].value;
    memEl[t] = el;
});

setInterval(() => {
    var pInfo = process.getProcessMemoryInfo();
    Object.keys(memEl).forEach(k => {
        memEl[k].innerHTML = Math.round(pInfo[k] / 2014);
    });

}, 2000);