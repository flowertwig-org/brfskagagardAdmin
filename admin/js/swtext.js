(function(w) {
    "use strict";
    var Text = function(storage) {
        if (!(this instanceof Text)) {
            return new Text();
        }
        
        this.storage = storage;
        
        return this.init();
    }
    Text.prototype = {
        init: function () {
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
    }
    w.swText = Text;
})(window);