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

    var options = document.createElement('ul');
    options.className = 'sw-onpage-options-items';

    /*
        # Navigation
        # Pending Changes
        # Pages
    */
    var navigation = document.createElement('li');
    navigation.className = 'sw-onpage-options-item';
    navigation.innerHTML = '<span>Navigation</span>';
    navigation.addEventListener('click', function (e) {
        navigation.innerHTML = "<span>Navigation</span>";

        sw.storage.list('/', function (list, callStatus) {
            if (callStatus.isOK) {
                var node = document.createElement("ul");
                node.className = 'sw-onpage-navigation-items';
                
                var files = '';
                var folders = '';
                for (var index = 0; index < list.length; index++) {
                    var item = list[index];
                    if (item.name.indexOf('.html') > 0) {
                        files += '<li title="' + item.name + '">' + item.name + '</li>';
                   }else if (item.name.indexOf('.') === -1) {
                       folders += '<li title="' + item.name + '">[+] ' + item.name + '</li>';
                   }
                }
                
                node.innerHTML = folders + files;
                // node.innerHTML = '<li>/</li><li>/nyheter</li><li>/medlem<ul class="sw-onpage-navigation-items"><li>/ordningsregler</li></ul></li>';
                navigation.appendChild(node);
                console.log('navigation');
            }
        });
    });

    options.appendChild(navigation);

    // navigation = document.createElement('li');
    // navigation.className = 'sw-onpage-options-item';
    // navigation.innerText = 'Navigation';
    // options.appendChild(navigation);
    // navigation = document.createElement('li');
    // navigation.className = 'sw-onpage-options-item';
    // navigation.innerText = 'Navigation';
    // options.appendChild(navigation);
    // nav.appendChild(options);
    // navigation = document.createElement('li');
    // navigation.className = 'sw-onpage-options-item';
    // navigation.innerText = 'Navigation';
    // options.appendChild(navigation);
    // navigation = document.createElement('li');
    // navigation.className = 'sw-onpage-options-item';
    // navigation.innerText = 'Navigation';
    // options.appendChild(navigation);

    nav.appendChild(options);

    document.getElementsByTagName('body')[0].appendChild(nav);
})(StaticWeb);