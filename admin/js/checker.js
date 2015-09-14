(function () {
    //var cookieName = 'staticweb-token';
    var cookieName = 'token';

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
        // Load admin script(s)
        includeScript('/admin/js/admin.js');
    }
})();
