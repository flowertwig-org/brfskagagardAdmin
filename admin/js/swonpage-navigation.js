/* global StaticWeb */
(function (sw) {

    function getPath(name) {
        var name = name.replace('/index.html', '');
        if (name.length > 0 && name[name.length - 1] !== '/') {
            name = name + '/';
        }
        if (name === '') {
            name = '/';
        }
        return name;
    }

    function getDisplayName(name) {
        var name = name.replace('/index.html', '');
        if (name.length > 0 && name[name.length - 1] === '/') {
            name = name.substring(0, name.length - 1);
        }
        if (name === '') {
            name = '/';
        }
        return name;
    }

    function createItem(item, depth) {
        if (!sw.inAdminPath() && sw.config.onPage.navigation.ignorePaths.indexOf(item.name) !== -1) {
            return '';
        }
        
        var displayName = getDisplayName(item.path);
        var link = displayName;
        
        var path = getPath(item.path);
        var locationPath = getPath(location.pathname);

        var isSelected = (locationPath === path);
        var hasDepth = depth > 0;
        
        while (depth) {
            displayName = "&nbsp;&nbsp;" + displayName;
            depth--;
        }
        
        if (isSelected && hasDepth) {
            displayName = displayName.replace("&nbsp;", "");
        }

        var file = '<li class="' + (isSelected ? 'sw-onpage-navigation-item-selected' : '') + '" title="' + item.name + '" data-sw-nav-item-path="' + item.path + '" data-sw-nav-item-folder="' + path + '" data-sw-nav-item-type="file"><span>';
        file += '<a href="' + link + '" class="sw-onpage-navigation-item-link">' + displayName + '</a>';
        if (isSelected) {
            file += '<a href="#" title="Delete ' + displayName + '" class="sw-onpage-navigation-item-delete">x</a>';
            file += '<a href="#" title="Add a sub-page for ' + displayName + '" class="sw-onpage-navigation-item-add">+</a>';
        }
        file += '</li>';
        var index = 0;
        while (item.children.length > index) {
            file += createItem(item.children[index], depth + 1);
            index++;
        }

        return file;
    }
    
    function sortItems(a, b) {
            var aPath = a.test; // getPath(a.path);
            var bPath = b.test; // getPath(b.path);
            
            if (aPath < bPath) {
                return -1;
            }
            if (aPath > bPath) {
                return 1;
            }
            return 0;
    }

    function createNodeWithItems(list) {
        var node = document.createElement("ul");
        node.className = 'sw-onpage-navigation-items';
        
        // update object
        for (var index = 0; index < list.length; index++) {
            var item = list[index];
            item.test = getPath(item.path);
            item.children = [];
        }

        list.sort(sortItems);
        
        var index = 1;
        while (list.length > index && list[index]) {
            var prev = list[index -1];
            var current = list[index];
            if (current.test.indexOf(prev.test) !== -1) {
                prev.children.push(current);
                list.splice(index, 1);
            }else {
                index++;
            }
        }
        
        var files = '';
        var folders = '';
        var depth = 0;
        for (var index = 0; index < list.length; index++) {
            var item = list[index];
            files += createItem(item, depth);
        }

        node.innerHTML = folders + files;
        return node;
    }

    function showCreatePageDialog(addr, folder) {
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
                        var pageName = inputFolder.value + inputName.value + '/index.html';
                        var templateLocation = el.getAttribute('data-sw-onpage-createpage-template');
                        sw.addPage(pageName, templateLocation);
                    }
                });
            }
        });
    }

    function showNavigation(navigation, navigationHeader, navigationList) {
        sw.storage.list('/', function (list, callStatus) {
            if (callStatus.isOK) {
                var node = createNodeWithItems(list);
                navigationList.appendChild(node);

                node.addEventListener('click', function (e) {
                    if (e.target.classList.contains('sw-onpage-navigation-item-add')) {
                        var addr = e.target.parentNode.parentNode.getAttribute('data-sw-nav-item-path');
                        var folder = e.target.parentNode.parentNode.getAttribute('data-sw-nav-item-folder');

                        showCreatePageDialog(addr, folder);
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
                });

                navigation.setAttribute('data-sw-nav-expandable', '1');
                navigationHeader.style.paddingBottom = '5px';
                navigationHeader.style.borderBottom = 'solid 3px rgb(47, 85, 117)';
            }
        });
    }

    var itemElement = document.getElementsByClassName('sw-onpage-navigation-item')[0];
    var headerElement = itemElement.getElementsByClassName('sw-onpage-options-item-header')[0];
    var contentElement = itemElement.getElementsByClassName('sw-onpage-options-item-content')[0];

    showNavigation(itemElement, headerElement, contentElement);

})(StaticWeb);