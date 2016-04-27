/* global StaticWeb */
(function (sw) {
    var adminPath = sw.getAdminPath();

    var nav = document.createElement('div');
    nav.className = 'sw-onpage-options';
    nav.style.position = 'fixed';
    nav.style.top = '0px';
    nav.style.margin = '0 auto';
    //nav.style.width = '100%';
    nav.style.zIndex = '100000';
    var header = document.createElement('div');
    header.className = 'sw-onpage-options-header';
    header.innerText = 'StaticWeb';
    nav.appendChild(header);

    var dragdown = document.createElement('div');
    dragdown.className = 'sw-dragdown';
    dragdown.addEventListener('click', function (event) {
        document.body.classList.toggle('sw-onpage-options-show');
        if (dragdown.innerText === '+') {
            dragdown.innerText = '-';

        } else {

            dragdown.innerText = '+';
        }
    });

    switch (sw.config.onPage.display) {
        case 'onDemand':
            dragdown.innerText = '+';
            break;
        case 'always':
            dragdown.innerText = '-';
            document.body.classList.toggle('sw-onpage-options-show');
            break;
        default:
            break;
    }
    nav.appendChild(dragdown);

    var options = document.createElement('div');
    options.className = 'sw-onpage-options-items';
    var navigation = document.createElement('div');
    navigation.innerText = '# Pending Changes\r\n# Navigation\r\n# Pages\r\n';
    options.appendChild(navigation);
    nav.appendChild(options);

    document.getElementsByTagName('body')[0].appendChild(nav);
})(StaticWeb);