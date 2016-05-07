/* global StaticWeb */
(function (sw) {
    function getOnPage() {
        var onPageDisplaySetting = sw.config.onPage.display;
        var tmp = localStorage.getItem("sw.onPage.display");
        if (tmp === "always") {
            onPageDisplaySetting = "always";
        } else if (tmp === "onDemand") {
            onPageDisplaySetting = "onDemand";
        }
        return onPageDisplaySetting;
    }

    function updateOnPage(onPageDisplay) {
        if (onPageDisplay) {
            localStorage.setItem('sw.onPage.display', onPageDisplay);
            if (onPageDisplay === "onDemand") {
                updateNavigation("onDemand");
            }
        }
    }

    function getNavigation() {
        var onPageDisplaySetting = sw.config.onPage.navigation.display;
        var tmp = localStorage.getItem("sw.onPage.navigation.display");
        if (tmp === "always") {
            onPageDisplaySetting = "always";
        } else if (tmp === "onDemand") {
            onPageDisplaySetting = "onDemand";
        }
        return onPageDisplaySetting;
    }

    function updateNavigation(onPageNavigationDisplay) {
        if (onPageNavigationDisplay) {
            localStorage.setItem('sw.onPage.navigation.display', onPageNavigationDisplay);
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
                updateNavigation("onDemand");
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

                        if (!sw.inAdminPath() && sw.config.onPage.navigation.ignorePaths.indexOf(item.name) !== -1) {
                            continue;
                        }

                        var displayName = item.path.replace('/index.html', '');
                        if (displayName.length > 0 && displayName[displayName.length - 1] === '/') {
                            displayName = displayName.substring(0, displayName.length - 1)
                        }
                        if (displayName === '') {
                            displayName = '/';
                        }

                        var locationPath = location.pathname.replace('/index.html', '');
                        if (locationPath.length > 0 && locationPath[locationPath.length - 1] === '/') {
                            locationPath = locationPath.substring(0, locationPath.length - 1)
                        }

                        if (locationPath === '') {
                            locationPath = '/';
                        }

                        var isSelected = (locationPath === displayName);
                        console.log('isSelected', location.pathname, item.path);

                        // if (item.name.indexOf('.') === -1) {
                        //     folders += '<li class="' + (isSelected ? 'sw-onpage-navigation-item-selected' : '') + '" title="' + item.name + '" data-sw-nav-item-path="' + item.path + '" data-sw-nav-item-folder="' + displayName + '" data-sw-nav-item-type="folder">[+] <a href="' + item.path + '">' + displayName + '</a></li>';
                        // } else {
                        files += '<li class="' + (isSelected ? 'sw-onpage-navigation-item-selected' : '') + '" title="' + item.name + '" data-sw-nav-item-path="' + item.path + '" data-sw-nav-item-folder="' + displayName + '" data-sw-nav-item-type="file"><span>';
                        files += '<a href="' + item.path + '" class="sw-onpage-navigation-item-link">' + displayName + '</a>';
                        if (isSelected) {
                            files += '<a href="#" title="Delete ' + item.name + '" class="sw-onpage-navigation-item-delete">x</a>';
                            files += '<a href="#" title="Add a sub-page for ' + item.name + '" class="sw-onpage-navigation-item-add">+</a>';
                        }
                        files += '</span></li>';
                        // }
                    }

                    node.innerHTML = folders + files;
                    navigationList.appendChild(node);

                    node.addEventListener('click', function (e) {
                        if (e.target.classList.contains('sw-onpage-navigation-item-add')) {
                            var addr = e.target.parentNode.parentNode.getAttribute('data-sw-nav-item-path');
                            var folder = e.target.parentNode.parentNode.getAttribute('data-sw-nav-item-folder');

                            console.log('add', addr);
                            var dialog = document.createElement('div');
                            dialog.className = 'sw-dialog';
                            var dialogHeader = document.createElement('div');
                            dialogHeader.className = 'sw-onpage-options-header';
                            dialogHeader.innerHTML = 'StaticWeb - Create new page<a href="#" title="Close dialog" class="sw-onpage-navigation-item-close">x</a>';
                            dialog.appendChild(dialogHeader);

                            var dialogContent = document.createElement('div');
                            dialogContent.className = 'sw-dialog-content';
                            dialog.appendChild(dialogContent);

                            var pageNameElement = document.createElement('div');
                            pageNameElement.innerHTML = '<b style="display:block;padding:5px;padding-bottom:10px">Page name:</b><input id="sw-onpage-createpage-parent" type="hidden" value="' + folder + '" /><input id="sw-onpage-createpage-name" type="text" style="font-size:20px" />';
                            dialogContent.appendChild(pageNameElement);

                            var templates = document.createElement('div');
                            templates.innerHTML = '<b style="display:block;padding:5px;padding-bottom:10px;padding-top:30px">Choose template to use:</b>loading page templates...';
                            dialogContent.appendChild(templates);

                            document.getElementsByTagName('body')[0].appendChild(dialog);

                            var adminPath = sw.getAdminPath().replace(location.protocol + '//' + location.host, '');
                            sw.storage.list(adminPath + 'templates/page/', function (info, status) {
                                if (status.isOK) {
                                    var list = arguments[0];
                                    var elements = [];
                                    elements.push('<b style="display:block;padding:5px;padding-bottom:10px;padding-top:30px">Choose template to use:</b>');
                                    for (var i = 0; i < list.length; i++) {
                                        var isPreview = list[i].path.indexOf('.jpg') > 0 || list[i].path.indexOf('.jpeg') > 0 || list[i].path.indexOf('.png') > 0 || list[i].path.indexOf('.gif') > 0;
                                        if (isPreview) {
                                            var name = list[i].name.replace('.jpg', '').replace('.jpeg', '').replace('.png', '').replace('.gif', '');
                                            var path = list[i].path.replace('.jpg', '').replace('.jpeg', '').replace('.png', '').replace('.gif', '') + '.html';
                                            elements.push('<div class="sw-onpage-navigation-createpage-template" data-sw-onpage-createpage-template="' + path + '" style="margin:5px;padding:1px;width:250px;display:inline-block;background-color:#2F5575;color:#fff;vertical-align:top;border-radius:6px;"><b style="display:block;padding:4px">' + name + '</b><img src="' + list[i].path + '" width="100%" style="cursor:pointer" /></div>');

                                        }
                                    }
                                    templates.innerHTML = elements.join('');
                                    templates.addEventListener('click', function (e) {
                                        var el = e.target.parentNode;
                                        if (el.classList.contains('sw-onpage-navigation-createpage-template')) {
                                            var inputName = document.getElementById('sw-onpage-createpage-name');
                                            var inputFolder = document.getElementById('sw-onpage-createpage-parent');
                                            var pageName = inputFolder.value + '/' + inputName.value + '/index.html';
                                            var templateLocation = el.getAttribute('data-sw-onpage-createpage-template');
                                            sw.addPage(pageName, templateLocation);
                                            console.log('template', pageName, templateLocation);
                                        }
                                    });
                                }
                            });
                        }
                        else if (e.target.classList.contains('sw-onpage-navigation-item-delete')) {
                            var addr = e.target.parentNode.parentNode.getAttribute('data-sw-nav-item-path');
                            if (confirm('Are you sure you want to delete "' + addr + '"?')) {
                                sw.storage.del(addr + '/index.html', function (status) {
                                    if (status.isOK) {
                                        console.log('successfully deleted page', addr);
                                    }
                                })
                            }
                        }
                        //console.log(e.target); 
                    });

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
    var navigationHeader = document.createElement('div');
    navigationHeader.className = 'sw-onpage-options-item-header'
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