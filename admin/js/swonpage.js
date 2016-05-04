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
    //navigation.innerHTML = '<span>Navigation</span>';
    var navigationHeader = document.createElement('div');
    navigationHeader.innerText = 'Navigation';
    var navigationList = document.createElement('div');

    navigationHeader.addEventListener('click', function (e) {
        if (navigation.hasAttribute('data-sw-nav-expandable')) {
            var isHidden = navigationList.style.display === 'none';
            if (isHidden) {
                navigationList.style.display = 'block';
                navigationHeader.style.paddingBottom = '5px';
                navigationHeader.style.borderBottom = 'solid 3px rgb(47, 85, 117)';
            } else {
                navigationList.style.display = 'none';
                navigationHeader.style.paddingBottom = '0';
                navigationHeader.style.borderBottom = '0';
            }
        } else {
            sw.storage.list('/', function (list, callStatus) {
                if (callStatus.isOK) {
                    var node = document.createElement("ul");
                    node.className = 'sw-onpage-navigation-items';

                    var files = '';
                    var folders = '';
                    for (var index = 0; index < list.length; index++) {
                        var item = list[index];
                        var isSelected = (location.pathname === item.path) || (location.pathname + "index.html" === item.path);
                        
                        if (item.name.indexOf('.html') > 0) {
                            files += '<li class="' + (isSelected ? 'sw-onpage-navigation-item-selected' : '') + '" title="' + item.name + '" data-sw-nav-item-path="' + item.path + '" data-sw-nav-item-type="file"><a href="' + item.path + '">' + item.name + '</a></li>';
                        } else if (item.name.indexOf('.') === -1) {
                            folders += '<li class="' + (isSelected ? 'sw-onpage-navigation-item-selected' : '') + '" title="' + item.name + '" data-sw-nav-item-path="' + item.path + '" data-sw-nav-item-type="folder">[+] <a href="' + item.path + '">' + item.name + '</a></li>';
                        }
                    }

                    node.innerHTML = folders + files;
                    navigationList.appendChild(node);
                    navigation.setAttribute('data-sw-nav-expandable', '1');
                    navigationHeader.style.paddingBottom = '5px';
                    navigationHeader.style.borderBottom = 'solid 3px rgb(47, 85, 117)';
                    console.log('navigation');
                }
            });
        }
    });

    navigation.appendChild(navigationHeader);
    navigation.appendChild(navigationList);

    options.appendChild(navigation);
    nav.appendChild(options);

    document.getElementsByTagName('body')[0].appendChild(nav);
})(StaticWeb);