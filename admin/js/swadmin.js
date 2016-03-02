/* global jStorage */
(function (w) {
    "use strict";
    var StaticWeb = function () {
        if (!(this instanceof StaticWeb)) {
            return new StaticWeb();
        }

        this.config = {};
        this.cookieName = 'staticweb-token';
        // all loaded components should store them self here.
        this.components = {};
        
        // set folder location from staticweb.js
        var path = this.getAdminPath()
        this.loginPages = {};
        this.loginPages[path] = true;
        this.loginPages[path + 'index.html'] = true;

        this.storage = false;

        return this.init();
    }
    StaticWeb.prototype = {
        init: function () {
            var self = this;
            var token = this.getToken();
            // Do we have a valid token?
            if (token) {
                this.loadAdminState(token);
            } else {
                var button = document.getElementById('staticweb-login-btn')
                button.addEventListener('click', function () {
                    var input = document.getElementById('staticweb-login-token');
                    var token = self.sanitizeToken(input.value);
                    if (token) {
                        self.loadAdminState(token);
                    } else {
                        alert('Ogiltigt personligt åtkomsttoken.');
                    }
                });
            }
        },
        getAdminPath: function () {
            var adminPath = '/staticweb/';
            var scripts = document.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                var url = scripts[i].src;
                if (url && url.indexOf('js/swadmin.js') >= 0) {
                    adminPath = url.replace('js/swadmin.js', '');
                    break;
                }
            }
            return adminPath;
        },
        loadAdminState: function (token) {
            var self = this;
            var adminPath = this.getAdminPath();
            this.loadComponents();

            this.includeScript(adminPath + 'js/jStorage.js');
            this.includeScript(adminPath + 'js/swconfig.js');
            self.ensureLoaded('storage', self.config, function () {
                self.ensureLoaded('jStorage', window, function () {
                    self.includeScript(adminPath + 'js/jStorage.' + self.config.storage.type + '.js');
                    self.ensureLoaded(self.config.storage.type, jStorage.providers, function () {
                        self.storage = jStorage({
                            'name': self.config.storage.type,
                            'repo': self.config.storage.repo,
                            'token': token,
                            'callback': function (storage, callStatus) {
                                if (callStatus.isOK) {
                                    self.writeCookie(self.cookieName, token);

                                    if (location.href in self.loginPages) {
                                        self.showNavigation();
                                        self.removeLogin();
                                    }

                                    self.config.storage.isReady = true;
                                } else {
                                    alert('Ogiltigt personligt åtkomsttoken.');
                                    self.writeCookie(self.cookieName, '');
                                    location.reload();
                                }
                            }
                        });
                    });
                });
            });
        },
        addResource: function (resourceName, data) {
            // TODO: queue requests that are done until we have a valid storage
            this.storage.set(resourceName, data, function (fileMeta, callStatus) {
                if (callStatus.isOK) {
                    alert('saved');
                } else {
                    alert('fail, error code: 1');
                }
            });
        },
        updateResource: function (resourceName, data) {
            // TODO: queue requests that are done until we have a valid storage
            // NOTE: We can only update file if we have previously called getResource....
            this.storage.set(resourceName, data, function (fileMeta, callStatus) {
                if (callStatus.isOK) {
                    alert('saved');
                } else {
                    alert('fail, error code: 1');
                }
            });
        },
        updateCurrentPage: function () {
            var resourceName = location.pathname.substring(1);
            if (resourceName.length == 0) {
                resourceName = "index.html";
            }
            if (resourceName[resourceName.length - 1] === '/') {
                resourceName = resourceName + "index.html";
            }
            this.updatePage(resourceName);
        },
        updatePage: function (containerId, containerTagName, resourceName, content) {
            /* TODO: Add following properties */
            var self = this;

            content = this.encodeToHtml(content);
            content = content.replace(regexp, '');

            // new content to replace current with
            // var content = '';
            // // container div for this component
            // var containerId = false;
            // var containerTagName = false;
            // Disallowed chars regex
            var regexp = /([^a-z0-9!{}<>/\;&#\:\ \=\\r\\n\\t\"\'\%\*\-\.\,\(\)\@])/gi;

            self.storage.get(resourceName, function (file, callStatus) {
                if (callStatus.isOK) {
                    //alert('file loaded: \r\n' + file.data);
                    var data = file.data;
                    data = data ? data.replace(regexp, '') : '';

                    var index = data.indexOf('id="' + containerId + '"');
                    index = data.indexOf('>', index);
                    index++;

                    var tagName = containerTagName.toLowerCase();
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
                        
                        self.updateResource(resourceName, newData);
                    } else {
                        alert('fail, error code: 2');
                        console.log('no match');
                    }
                }
            })
        },
        loadComponents: function () {
            var self = this;
            var adminPath = self.getAdminPath();
            var elements = document.getElementsByClassName('staticweb-component');
            for (var index = 0; index < elements.length; index++) {
                var element = elements[index];
                var attr = element.attributes['data-staticweb-component'];
                if (attr) {
                    self.includeScript(adminPath + 'js/components/' + attr.value + '.js');
                }
            }
        },
        writeCookie: function (name, value, days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            }
            document.cookie = name + "=" + value + expires + "; path=/";
        },
        readCookie: function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },
        includeScript: function (addr) {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = addr;
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        },
        ensureLoaded: function (name, container, callback) {
            var self = this;
            setTimeout(function () {
                if (name in container) {
                    callback();
                } else {
                    self.ensureLoaded(name, container, callback);
                }
            }, 100);
        },
        sanitizeToken: function (token) {
            var regexp = /([^a-z0-9])/gi;
            token = token ? token.replace(regexp, '') : '';
            return token;
        },
        encodeToHtml: function (data) {
            var toHtmlCode = function (char) { return '&#' + char.charCodeAt('0') + ';'; };
            return data.replace(/([^a-z0-9!{}<>/\;&#\:\ \=\\r\\n\\t\"\'\%\*\-\.\,\(\)\@])/gi, toHtmlCode);
        },
        getToken: function () {
            var token = this.readCookie(this.cookieName);
            return this.sanitizeToken(token);
        },

        showNavigation: function () {
            var nav = document.getElementsByClassName('navigation')[0];
            nav.style.display = "block";
        },

        removeLogin: function () {
            var mood = document.getElementsByClassName('mood')[0];
            mood.className = "mood";

            var callToAction = document.getElementsByClassName('call-to-action')[0];
            callToAction.remove();
        }

    }
    w.StaticWeb = StaticWeb();
})(window);






