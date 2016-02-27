(function (w) {
    "use strict";
    var StaticWeb = function () {
        if (!(this instanceof StaticWeb)) {
            return new StaticWeb();
        }

        this.config = {
            // 'storageType': false,
            // 'storageRepo': false,
            // 'storageToken': false
        };
        // this.cookieName = 'staticweb-token';
        this.cookieName = 'token';
        
        // set folder location from staticweb.js
        var path = this.getAdminPath()
        this.loginPages = {};
        this.loginPages[path] = true;
        this.loginPages[path + '/index.html'] = true;

        this.storage = false;

        return this.init();
    }
    StaticWeb.prototype = {
        init: function () {

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
        encodetoHtml: function (data) {
            var toHtmlCode = function (char) { return '&#' + char.charCodeAt('0') + ';'; };
            return data.replace(/([^a-z0-9!{}<>/\;&#\:\ \=\\r\\n\\t\"\'\%\*\-\.\,\(\)\@])/gi, toHtmlCode);
        },
        getToken: function () {
            var token = this.readCookie(this.cookieName);
            return this.sanitizeToken(token);
        }

    }
    w.StaticWeb = StaticWeb();
})(window);

    
// var cookieName = 'token';
// var loginPages = { '/admin/': true, '/admin/index.html': true };


// var storage = false;
// var self = this;

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

function changeTextContent() {
    includeScript("/admin/js/swtext.js");
    ensureLoaded('swText', window, function () {
        swText();
    });
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
                        alert('Ogiltigt personligt �tkomsttoken.');
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
            alert('Ogiltigt personligt �tkomsttoken.');
        }
    });
}

