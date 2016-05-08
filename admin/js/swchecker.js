/* global jStorage */
(function (w) {
    "use strict";
    var StaticWebDefinition = function () {
        if (!(this instanceof StaticWebDefinition)) {
            return new StaticWebDefinition();
        }
        return this.init();
    }
    StaticWebDefinition.prototype = {
        init: function () {

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
        inAdminPath: function () {
            return location.toString().indexOf(StaticWeb.getAdminPath()) !== -1;
        },
        getAdminPath: function () {
            var adminPath = '/staticweb/';
            var scripts = document.getElementsByTagName('script');
            var adminJs = 'js/swadmin.js';
            var checkerJs = 'js/swchecker.js';
            for (var i = 0; i < scripts.length; i++) {
                var url = scripts[i].src;
                if (url && url.indexOf(adminJs) >= 0) {
                    adminPath = url.replace(adminJs, '');
                    break;
                } else if (url && url.indexOf(checkerJs) >= 0) {
                    adminPath = url.replace(checkerJs, '');
                    break;
                }
            }
            if (adminPath){
                adminPath = adminPath.replace(location.protocol + '//' + location.host, '');
            }
            
            return adminPath;
        },
        includeScript: function (addr) {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = addr;
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        }
    }

    w.StaticWebDefinition = StaticWebDefinition;
    w.StaticWeb = StaticWebDefinition();
})(window);

(function (staticWeb) {
    var cookieName = 'staticweb-token';
    // If we have cookie, we are signed in and show load admin.
    var token = staticWeb.readCookie(cookieName);
    if (token || staticWeb.inAdminPath()) {
        var path = staticWeb.getAdminPath();
        // Load admin script(s)
        staticWeb.includeScript(path + 'js/swadmin.js');
    }
})(window.StaticWeb);