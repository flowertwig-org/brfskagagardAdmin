/* global StaticWeb */
(function (sw) {
    sw.config.storage = {
        'type': 'github',
        'repo': 'flowertwig-org/brfskagagardAdmin'
    }
    sw.config.cookieName = 'staticweb-token';
    sw.config.onPage = {
        // Tells StaticWeb show general menu, options and more not present as components on page
        'display': 'onDemand', // 'onDemand', 'always', 'no' 
        'navigation': {
            'display': 'onDemand' // 'onDemand', 'always', 'no'
        }
    };
})(StaticWeb);
