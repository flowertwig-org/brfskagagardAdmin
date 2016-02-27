(function () {
    var cookieName = 'staticweb-token';

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

    // If we have cookie, we are signed in and show load admin.
    var token = readCookie(cookieName);
    if (token) 
    {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var url = scripts[i].src;
            if (url && url.indexOf('js/checker.js') >= 0) {
                url = url.replace('checker.js', '');
                // Load admin script(s)
                includeScript( url + 'swadmin.js');
                break;
            }
        }
    }
})();
