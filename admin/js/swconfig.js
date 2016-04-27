/* global StaticWeb */
(function (sw) {
    sw.config.storage = {
        'type': 'github',
        'repo': 'flowertwig-org/brfskagagardAdmin'
    }
    sw.config.cookieName = 'staticweb-token';
    sw.config.onPage = {
        'use': true, // Tells StaticWeb show general menu, options and more not present as components on page
        'navigation': {
            'display': 'onDemand' // 'onDemand', 'Always', 'no'
        }
    };
})(StaticWeb);
