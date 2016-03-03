/* global tinymce */
(function (staticWeb) {
    "use strict";
    var Text = function () {
        if (!(this instanceof Text)) {
            return new Text();
        }
        
        return this.init();
    }
    Text.prototype = {
        save: function (editor) {            
            if (editor && editor.startContent) {
                var resourceName = location.pathname.substring(1);
                if (!resourceName || resourceName[resourceName.length -1] == '/') {
                    resourceName += 'index.html';
                }

                var container = editor.bodyElement;
                var content = container.innerHTML;
                                
                staticWeb.updatePage(container.id, container.tagName, resourceName, content);
            }
        },
        init: function () {
            var self = this;
            
            staticWeb.includeScript("//tinymce.cachefly.net/4.3/tinymce.min.js");
            staticWeb.ensureLoaded('tinymce', window, function () {
                // TODO: see if element in question have a 'data-staticweb-component-swtext-data' attribute and use that for the toolbar options
                tinymce.init({
                    selector: ".staticweb-component[data-staticweb-component=swtext]",
                    inline: true,
                    menubar: false,
                    browser_spellcheck: true,
                    plugins: "save",
                    toolbar: "save | bold italic | bullist numlist outdent indent | link image | undo redo",
                    save_onsavecallback: self.save
                });
            });
        }
    }
    staticWeb.components.swText = new Text();
})(window.StaticWeb);