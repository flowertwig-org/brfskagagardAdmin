/* global StaticWeb */
(function (sw) {
    var adminPath = sw.getAdminPath();

    if (sw.config.onPage && sw.config.onPage.use) {
        var nav = document.createElement('div');

        nav.style.position = 'fixed';
        nav.style.top = '0px';
        nav.style.margin = '0 auto';
        nav.style.width = '100%';
        nav.style.zIndex = '100000';

        var dragdown = document.createElement('div');
        dragdown.innerText = '+';
        dragdown.style.cursor = 'pointer';
        dragdown.style.border = 'solid 1px lightgrey';
        dragdown.style.borderTop = '0px';
        dragdown.style.width = '1em';
        dragdown.style.padding = '5px';
        dragdown.style.fontWeight = 'bold';
        dragdown.style.backgroundColor = '#2F5575';
        dragdown.style.color = '#fff';
        dragdown.style.borderRadius = '0 0 6px 0';
        nav.appendChild(dragdown);
        document.getElementsByTagName('body')[0].appendChild(nav);
        //alert('on page option and navigation enabled');
    }
})(StaticWeb);