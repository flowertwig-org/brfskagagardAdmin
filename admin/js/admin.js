(function () {
    //var cookieName = 'staticweb-token';
    var cookieName = 'token';
    var loginPages = { '/admin/': true, '/admin/index.html': true };

    //var adminPath = '/admin/';
    //var scripts = document.getElementsByTagName('script');
    //for (var i = 0; i < scripts.length; i++) {
    //    var url = scripts[i].src;
    //    if (url && url.indexOf('js/checker.js') >= 0) {
    //        adminPath = url.replace('js/checker.js', '');
    //        break;
    //    }
    //}

    var storage = false;
    var self = this;

    function writeCookie(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function includeScript(addr) {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = addr;
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    }

    function showNavigation() {
        var nav = document.getElementsByClassName('navigation')[0];
        nav.style.display = "block";
    }

    function removeLogin() {
        var mood = document.getElementsByClassName('mood')[0];
        mood.className = "mood";

        var callToAction = document.getElementsByClassName('call-to-action')[0];
        callToAction.remove();
    }

    function sanitizeToken(token) {
        var regexp = /([^a-z0-9])/gi;
        token = token ? token.replace(regexp, '') : '';
        return token;
    }

    function encodetoHtml(data) {
        var toHtmlCode = function (char) { return '&#' + char.charCodeAt('0') + ';'; };
        return data.replace(/([^a-z0-9!{}<>/\;&#\:\ \=\\r\\n\\t\"\'\%\*\-\.\,\(\)\@])/gi, toHtmlCode);
    }

    function getToken() {
        var token = readCookie(cookieName);
        return sanitizeToken(token);
    }

    function ensureLoaded(name, container, callback) {
        setTimeout(function () {
            if (name in container) {
                callback();
            } else {
                ensureLoaded(name, container, callback);
            }
        }, 100);
    }


    function changeMood(storage) {
        var moods = document.getElementsByClassName('mood');
        if (moods.length == 1) {
            var mood = moods[0];
            var changeMood = document.createElement('span');
            changeMood.innerHTML = '<a href="#">Change image</a>';

            changeMood.style.position = 'absolute';
            changeMood.style.zIndex = 10;
            changeMood.style.margin = '20px';
            changeMood.style.padding = '10px';
            changeMood.style.backgroundColor = '#fff';
            changeMood.style.border = 'solid 1px lightgrey';

            mood.appendChild(changeMood);

            changeMood.addEventListener('click', function (event) {
                event.preventDefault();

                if (event.target.innerHTML.indexOf('Change image') >= 0) {
                    this.innerHTML = "Loading images ...";
                    var container = this;

                    storage.list('/img/mood/', function (info, status) {
                        console.log('arg', arguments);
                        if (status.isOK) {
                            var list = arguments[0];
                            var elements = [];
                            for (var i = 0; i < list.length; i++) {
                                list[i]
                                elements.push('<img src="' + list[i].path + '" width="200" title="' + list[i].name + '" style="cursor:pointer" />');
                            }
                            container.innerHTML = elements.join('');
                        }
                    });

                } else if (event.target.innerHTML.indexOf('Save') >= 0) {
                    // TODO: store mood image changes
                    var resourceName = location.pathname.substring(1);
                    storage.get(resourceName, function (fileMeta, callStatus) {
                        if (callStatus.isOK) {
                            var newData = fileMeta.data;

                            var image = mood.style.backgroundImage;
                            var index = image.indexOf('/img/mood');
                            image = '.' + image.substring(index);
                            image = image.substring(0, image.length - 1);

                            newData = newData.replace(mood.getAttribute('data-mood-orginal'), image);

                            if (newData.indexOf('<meta name="generator" content="StaticWeb" />') == -1) {
                                newData = newData.replace('</head>', '<meta name="generator" content="StaticWeb" /></head>');
                            }


                            storage.set(resourceName, newData, function (fileMeta2, callStatus2) {
                                if (callStatus2.isOK) {
                                    alert('saved');
                                } else {
                                    alert('fail, error code: 1');
                                }
                            });
                        } else {
                            alert('fail, error code: 0');
                        }
                    });
                } else {
                    if (event.target.tagName.toLowerCase() == 'img') {
                        var index = 0;
                        if (!mood.getAttribute('data-mood-orginal')) {
                            var orgImage = mood.style.backgroundImage;
                            index = orgImage.indexOf('/img/mood');
                            orgImage = orgImage.substring(index);
                            orgImage = orgImage.substring(0, orgImage.length - 1);
                            mood.setAttribute('data-mood-orginal', '.' + orgImage);
                       }

                        var image = event.target.src;
                        index = image.indexOf('/img/mood');
                        image = image.substring(index);
                        orgImage = image.substring(0, image.length - 1);
                        mood.style.backgroundImage = 'url(.' + image + ')';
                        changeMood.innerHTML = '<a href="#">Change image</a> | <a href="#">Save</a>';
                    } else {
                        changeMood.innerHTML = '<a href="#">Change image</a>';
                    }
                }
            });
        }
    }

    function changeTextContent(storage) {
        includeScript("//tinymce.cachefly.net/4.2/tinymce.min.js");
        ensureLoaded('tinymce', window, function () {
            tinymce.init({
                selector: ".sw-editable",
                inline: true,
                menubar: false,
                browser_spellcheck: true,
                plugins: "save",
                toolbar: "save | news-item-above news-item-below styleselect | bold italic | bullist numlist outdent indent | link image | undo redo",
                save_onsavecallback: storeDefaultPage,
                setup: function (editor) {
                    // Add a custom button
                    editor.addButton('news-item-above', {
                        title: 'Add section above this section',
                        image: './admin/img/newsItemAbove.png',
                        onclick: function () {
                            // Add you own code to execute something on click
                            editor.focus();
                            var node = editor.selection.getNode();
                            while (node.tagName.toLowerCase() != 'div' && node.className != 'news-item') {
                                node = node.parentNode;
                            }

                            var newsItem = document.createElement("div");
                            newsItem.className = "news-item";
                            newsItem.innerHTML = "<h2>Default title</h2><p>Default paragraf</p>";
                            node.parentNode.insertBefore(newsItem, node);
                        }
                    });
                    // Add a custom button
                    editor.addButton('news-item-below', {
                        title: 'Add section below this section',
                        image: './admin/img/newsItemBelow.png',
                        onclick: function () {
                            // Add you own code to execute something on click
                            editor.focus();
                            var node = editor.selection.getNode();
                            while (node.tagName.toLowerCase() != 'div' && node.className != 'news-item') {
                                node = node.parentNode;
                            }

                            var newsItem = document.createElement("div");
                            newsItem.className = "news-item";
                            newsItem.innerHTML = "<h2>Default title</h2><p>Default paragraf</p>";

                            var parentNode = node.parentNode;
                            var tmpNode = node.nextElementSibling;
                            if (tmpNode) {
                                node = tmpNode;
                            } else {
                                node = null;
                            }

                            parentNode.insertBefore(newsItem, node);
                        }
                    });

                }
            });
        });
    }

    function updateParking(parking, isFree) {
        if (isFree) {
            parking.className = 'parking occupied';
            parking.src = './img/parking-filler-occupied.png';
        } else {
            parking.className = 'parking';
            parking.src = './img/parking-filler-free.png';
        }
        parking.style.display = 'block';
        parking.style.opacity = 0.5;
        parking.style.cursor = 'pointer';
    }

    function storeParkingUpdate(parking, isFree) {
        self.storage.get('parking.html', function (file, callStatus) {
            if (callStatus.isOK) {
                //alert('file loaded: \r\n' + file.data);
                var data = file.data;
                var regexp = /([^a-z0-9!{}<>/\;&#\:\ \=\\r\\n\\t\"\'\%\*\-\.\,\(\)\@])/gi;
                data = data ? data.replace(regexp, '') : '';

                var cssStatus = isFree ? 'parking' : 'parking occupied';
                var newHtml = '<img src="./img/parking-filler.png" id="' + parking.id + '" class="' + cssStatus + '" />';

                data = data.replace('<img src="./img/parking-filler.png" id="' + parking.id + '" class="parking" />', newHtml);
                data = data.replace('<img src="./img/parking-filler.png" id="' + parking.id + '" class="parking occupied" />', newHtml);

                data = data ? data.replace(regexp, '') : '';
                if (data.indexOf('<meta name="generator" content="StaticWeb" />') == -1) {
                    data = data.replace('</head>', '<meta name="generator" content="StaticWeb" /></head>');
                }

                self.storage.set('parking.html', data, function (fileMeta, callStatus) {
                    if (callStatus.isOK) {
                        alert('done updating parking');
                    } else {
                        alert('fail to update parking, please refresh page');
                    }
                });
            }
        });
    }

    function parkingPage(storage) {
        var parkings = document.getElementsByClassName('parking');
        for (var i = 0; i < parkings.length; i++) {
            var parking = parkings[i];
            var isFree = parking.className.indexOf('occupied') >= 0;
            updateParking(parking, isFree);
            parking.addEventListener('click', function () {
                var isFree = this.className.indexOf('occupied') >= 0;
                storeParkingUpdate(this, isFree);
                updateParking(this, !isFree);
            });
        }

        changeTextContent(storage);
    }
    function storeDefaultPage(editor) {
        if (editor && editor.startContent) {
            var regexp = /([^a-z0-9!{}<>/\;&#\:\ \=\\r\\n\\t\"\'\%\*\-\.\,\(\)\@])/gi;
            var resourceName = location.pathname.substring(1);

            var container = editor.bodyElement;
            var content = container.innerHTML;
            content = encodetoHtml(content);
            content = content.replace(regexp, '');

            self.storage.get(resourceName, function (file, callStatus) {
                if (callStatus.isOK) {
                    //alert('file loaded: \r\n' + file.data);
                    var data = file.data;
                    data = data ? data.replace(regexp, '') : '';

                    var index = data.indexOf('id="' + container.id + '"');
                    index = data.indexOf('>', index);
                    index++;


                    var tagName = container.tagName.toLowerCase();
                    var tmp = data.substring(index);

                    var endIndex = 0;
                    var startIndex = 0;
                    var tagsInMemory = 0;

                    var found = false;
                    var insanityIndex = 0;
                    while (!found && insanityIndex < 10000) {
                        insanityIndex++;
                        endIndex = tmp.indexOf('</' + tagName, endIndex);
                        startIndex = tmp.indexOf('<' + tagName, startIndex);

                        if (startIndex == -1) {
                            // we have not found a start tag of same type so we have found our end tag.
                            if (tagsInMemory == 0) {
                                tmp = tmp.substring(0, endIndex);
                                found = true;
                            } else {
                                tagsInMemory--;
                                endIndex += tagName.length + 2;
                                startIndex = endIndex;
                            }
                        } else if (endIndex < startIndex) {
                            // start tag was found after our end tag so we have found our end tag.
                            if (tagsInMemory == 0) {
                                tmp = tmp.substring(0, endIndex);
                                found = true;
                            } else {
                                tagsInMemory--;
                                endIndex += tagName.length + 2;
                                startIndex = endIndex;
                            }
                        } else {
                            tagsInMemory++;
                            startIndex += tagName.length + 1;
                            endIndex = startIndex;
                        }
                    }

                    tmp = tmp.substring(0, endIndex);
                    console.log(tmp);


                    //if (data.indexOf(orginalContent) >= 0) {
                    if (data.indexOf(tmp) >= 0) {
                        console.log('found orginal');

                        // We have not reproduced same start content, now, replace it :)
                        var newData = data.replace(tmp, content);
                        if (newData.indexOf('<meta name="generator" content="StaticWeb" />') == -1) {
                            newData = newData.replace('</head>', '<meta name="generator" content="StaticWeb" /></head>');
                        }

                        self.storage.set(resourceName, newData, function (fileMeta, callStatus) {
                            if (callStatus.isOK) {
                                alert('saved');
                            } else {
                                alert('fail, error code: 1');
                            }
                        });

                    } else {
                        alert('fail, error code: 2');
                        console.log('no match');
                    }
                }
            });
        }
    }

    function newsPage(storage) {
        includeScript("//tinymce.cachefly.net/4.2/tinymce.min.js");
        ensureLoaded('tinymce', window, function () {
            tinymce.init({
                selector: ".sw-editable",
                inline: true,
                menubar: false,
                browser_spellcheck: true,
                plugins: "save",
                toolbar: "save | news-item-above news-item-below bold italic | bullist numlist outdent indent | link image",
                save_onsavecallback: storeDefaultPage,
                setup: function (editor) {
                    // Add a custom button
                    editor.addButton('news-item-above', {
                        title: 'Add section above this section',
                        image: './admin/img/newsItemAbove.png',
                        onclick: function () {
                            // Add you own code to execute something on click
                            editor.focus();
                            var node = editor.selection.getNode();
                            while (node.tagName.toLowerCase() != 'div' && node.className != 'news-item') {
                                node = node.parentNode;
                            }

                            var date = new Date();
                            var year = date.getFullYear();
                            var month = date.getMonth() + 1;
                            var day = date.getDate();

                            if (month < 10) {
                                month = "0" + month;
                            }
                            if (day < 10) {
                                day = "0" + day;
                            }

                            var strDate = year + "-" + month + "-" + day;

                            var newsItem = document.createElement("div");
                            newsItem.id = strDate;
                            newsItem.className = "news-item";
                            newsItem.innerHTML = "<h2>Default title</h2><div class=\"news-date\">" + strDate + "</div><p>Default paragraf</p>";
                            node.parentNode.insertBefore(newsItem, node);
                        }
                    });
                    // Add a custom button
                    editor.addButton('news-item-below', {
                        title: 'Add section below this section',
                        image: './admin/img/newsItemBelow.png',
                        onclick: function () {
                            // Add you own code to execute something on click
                            editor.focus();
                            var node = editor.selection.getNode();
                            while (node.tagName.toLowerCase() != 'div' && node.className != 'news-item') {
                                node = node.parentNode;
                            }

                            var date = new Date();
                            var year = date.getFullYear();
                            var month = date.getMonth() + 1;
                            var day = date.getDate();

                            if (month < 10) {
                                month = "0" + month;
                            }
                            if (day < 10) {
                                day = "0" + day;
                            }

                            var strDate = year + "-" + month + "-" + day;

                            var newsItem = document.createElement("div");
                            newsItem.id = strDate;
                            newsItem.className = "news-item";
                            newsItem.innerHTML = "<h2>Default title</h2><div class=\"news-date\">" + strDate + "</div><p>Default paragraf</p>";

                            var parentNode = node.parentNode;
                            var tmpNode = node.nextElementSibling;
                            if (tmpNode) {
                                node = tmpNode;
                            } else {
                                node = null;
                            }

                            parentNode.insertBefore(newsItem, node);
                        }
                    });
                }
            });
        });

        changeMood(storage);
    }

    function changeNavigation(storage) {
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
        dragdown.style.textAlign = 'center';
        dragdown.style.padding = '5px';
        dragdown.style.fontWeight = 'bold';
        dragdown.style.backgroundColor = '#ff2200';
        nav.appendChild(dragdown);
        document.getElementsByTagName('body')[0].appendChild(nav);

        dragdown.addEventListener('click', function (event) {
            event.preventDefault();
            if (event.target.tagName.toLowerCase() != 'img') {
                dragdown.style.backgroundColor = '#fff'; // ff2200
                this.innerHTML = "<span>loading page templates...</span>";
                dragdown.style.width = 'auto';
                dragdown.style.textAlign = 'left';
                var container = this;
                storage.list('/admin/templates/page/', function (info, status) {
                    if (status.isOK) {
                        nav.style.position = 'absolute';
                        nav.style.top = '0px';

                        var list = arguments[0];
                        var elements = [];
                        elements.push('<b style="display:block;padding:5px;padding-bottom:10px">Create page from:</b>');
                        //elements.push('<ul>');
                        for (var i = 0; i < list.length; i++) {
                            var isPreview = list[i].path.indexOf('.jpg') > 0 || list[i].path.indexOf('.jpeg') > 0 || list[i].path.indexOf('.png') > 0 || list[i].path.indexOf('.gif') > 0;
                            if (isPreview) {
                                var name = list[i].name.replace('.jpg', '').replace('.jpeg', '').replace('.png', '').replace('.gif', '');
                                elements.push('<div style="margin:5px;padding:1px;width:250px;display:inline-block;background-color:lightgrey;vertical-align:top"><b style="display:block;padding:4px">' + name + '</b><img src="' + list[i].path + '" width="100%" /></div>');
                            }
                        }
                        //elements.push('</ul>');
                        container.innerHTML = elements.join('');
                    }
                });
            } else {
                dragdown.innerText = '+';
                dragdown.style.cursor = 'pointer';
                dragdown.style.border = 'solid 1px lightgrey';
                dragdown.style.borderTop = '0px';
                dragdown.style.width = '1em';
                dragdown.style.textAlign = 'center';
                dragdown.style.padding = '5px';
                dragdown.style.fontWeight = 'bold';
                dragdown.style.backgroundColor = '#ff2200';

            }

        });
    }


    function defaultPage(storage) {
        changeTextContent(storage);
        changeMood(storage);
        changeNavigation(storage);
    }

    function loadAdminState(token) {
        includeScript('/admin/js/jStorage.js');

        ensureLoaded('jStorage', window, function () {
            includeScript('/admin/js/jStorage.github.js');
            ensureLoaded('github', jStorage.providers, function () {
                self.storage = jStorage({
                    'name': 'github',
                    'repo': 'flowertwig-org/brfskagagardAdmin',
                    'token': token,
                    'callback': function (storage, callStatus) {
                        if (callStatus.isOK) {
                            writeCookie(cookieName, token);

                            if (location.pathname in loginPages) {
                                showNavigation();
                                removeLogin();
                            }

                            switch (location.pathname) {
                                case '/parking.html':
                                    parkingPage(storage);
                                    break;
                                case '/news.html':
                                    newsPage(storage);
                                    break;
                                default:
                                    defaultPage(storage);
                                    break;
                            }
                        } else {
                            alert('Ogiltigt personligt åtkomsttoken.');
                            writeCookie(cookieName, '');
                            location.reload();
                        }
                    }
                });
            });
        });
    }

    var token = getToken();
    // Do we have a valid token?
    if (token) {
        loadAdminState(token);
    } else {
        var button = document.getElementById('staticweb-login-btn')
        button.addEventListener('click', function () {
            var input = document.getElementById('staticweb-login-token');
            var token = sanitizeToken(input.value);
            if (token) {
                loadAdminState(token);
            } else {
                alert('Ogiltigt personligt åtkomsttoken.');
            }
        });
    }
})();
