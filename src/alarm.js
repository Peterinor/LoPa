
var $ = jQuery;

// level = success, info, warning, danger
var alarm = function(content, level, alarm, closeAfter) {

    var a = alarm ? '<strong>' + alarm + '!</strong>' : '';
    var h = ' \
        <div class="alert alert-' + (level || 'info') + ' alert-dismissible fade in" role="alert"> \
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button> \
            ' + a + content + '. \
        </div>'

    var pc = {
        position: 'absolute',
        right: (window.innerWidth / 5) + 'px',
        top: '100px',
        'min-width': '200px',
        'z-index': 10000
    };

    var $el = $(h).appendTo('body').css(pc);

    closeAfter = closeAfter || 1000;
    if (closeAfter != -1) {
        setTimeout(function() {
            $el.alert('close');
        }, closeAfter);
    }
}

module.exports = alarm;