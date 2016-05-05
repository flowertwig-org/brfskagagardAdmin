/* global StaticWeb */
(function (sw) {
    function getOnPage() {
        var onPageDisplaySetting = sw.config.onPage.display;
        if (document.cookie.indexOf("sw.onPage.display=always") !== -1) {
            onPageDisplaySetting = "always";
        } else if (document.cookie.indexOf("sw.onPage.display=onDemand") !== -1) {
            onPageDisplaySetting = "onDemand";
        }
        return onPageDisplaySetting;
    }
    function updateOnPage(onPageDisplay) {
        if (onPageDisplay) {
            document.cookie = "sw.onPage.display=" + onPageDisplay + ";max-age=" + (60 * 60);
            if (onPageDisplay === "onDemand") {
                updateNavigation("onDemand");
            }
        }
    }

    function getNavigation() {
        var onPageDisplaySetting = sw.config.onPage.navigation.display;
        if (document.cookie.indexOf("sw.onPage.navigation.display=always") !== -1) {
            onPageDisplaySetting = "always";
        } else if (document.cookie.indexOf("sw.onPage.navigation.display=onDemand") !== -1) {
            onPageDisplaySetting = "onDemand";
        }
        return onPageDisplaySetting;
    }
    function updateNavigation(onPageNavigationDisplay) {
        if (onPageNavigationDisplay) {
            document.cookie = "sw.onPage.navigation.display=" + onPageNavigationDisplay + ";max-age=" + (60 * 60);
        }
    }

    function toggleOnPage(dragdown) {
        if (document.body.classList.toggle('sw-onpage-options-show')) {
            dragdown.innerText = '-';
            updateOnPage("always");
        } else {
            dragdown.innerText = '+';
            updateOnPage("onDemand");
        }
    }

    function toggleNavigationItems(navigation, navigationHeader, navigationList) {
        if (navigation.hasAttribute('data-sw-nav-expandable')) {
            var isHidden = navigationList.style.display === 'none';
            if (isHidden) {
                updateNavigation("always");
                navigationList.style.display = 'block';
                navigationHeader.style.paddingBottom = '5px';
                navigationHeader.style.borderBottom = 'solid 3px rgb(47, 85, 117)';
            } else {
                updateNavigation("no");
                navigationList.style.display = 'none';
                navigationHeader.style.paddingBottom = '0';
                navigationHeader.style.borderBottom = '0';
            }
        } else {
            updateNavigation("always");
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
                            files += '<li class="' + (isSelected ? 'sw-onpage-navigation-item-selected' : '') + '" title="' + item.name + '" data-sw-nav-item-path="' + item.path + '" data-sw-nav-item-type="file"><span>';
                            files += '<a href="' + item.path + '">' + item.name + '</a>';
                            if (isSelected) {
                                files += '<a href="#" title="Delete ' + item.name + '" class="sw-onpage-navigation-item-delete">x</a>';
                                files += '<a href="#" title="Add a sub-page for ' + item.name + '" class="sw-onpage-navigation-item-add">+</a>';
                            }
                            files += '</span></li>';
                        } else if (item.name.indexOf('.') === -1) {
                            folders += '<li class="' + (isSelected ? 'sw-onpage-navigation-item-selected' : '') + '" title="' + item.name + '" data-sw-nav-item-path="' + item.path + '" data-sw-nav-item-type="folder">[+] <a href="' + item.path + '">' + item.name + '</a></li>';
                        }
                    }

                    node.innerHTML = folders + files;
                    navigationList.appendChild(node);
                    navigation.setAttribute('data-sw-nav-expandable', '1');
                    navigationHeader.style.paddingBottom = '5px';
                    navigationHeader.style.borderBottom = 'solid 3px rgb(47, 85, 117)';
                }
            });
        }

    }

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
        toggleOnPage(dragdown);
    });

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
        toggleNavigationItems(navigation, navigationHeader, navigationList);
    });

    navigation.appendChild(navigationHeader);
    navigation.appendChild(navigationList);

    options.appendChild(navigation);
    nav.appendChild(options);

    var onPageDisplaySetting = getOnPage();
    var onNavigation = getNavigation();
    switch (onPageDisplaySetting) {
        case 'onDemand':
            dragdown.innerText = '+';
            break;
        case 'always':
            toggleOnPage(dragdown);
            break;
        default:
            break;
    }
    if (onNavigation === "always") {
        toggleNavigationItems(navigation, navigationHeader, navigationList);
    }

    document.getElementsByTagName('body')[0].appendChild(nav);
})(StaticWeb);