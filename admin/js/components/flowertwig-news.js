/* global tinymce */
(function (staticWeb) {
    "use strict";
    var News = function () {
        if (!(this instanceof News)) {
            return new News();
        }

        return this.init();
    }
    News.prototype = {
        onStorageReady: function (storage, permissions) {
            var self = this;
            if (!staticWeb.config.permissions.check || permissions.indexOf('admin') > 0) {
                self.createInterface();
            }
        },
        createInterface: function () {
            var self = this;
            staticWeb.includeScript("//tinymce.cachefly.net/4.3/tinymce.min.js");
            staticWeb.ensureLoaded('tinymce', window, function () {
                var elements = staticWeb.elements['flowertwig-news'];
                for (var index = 0; index < elements.length; index++) {
                    var element = elements[index];
                    // TODO: see if element in question have a 'data-staticweb-component-swtext-data' attribute and use that for the toolbar options
                    tinymce.init({
                        selector: '#' + element.id,
                        inline: true,
                        menubar: false,
                        browser_spellcheck: true,
                        plugins: "save",
                        toolbar: "save | news-item-above news-item-below bold italic | bullist numlist outdent indent | link image | undo redo",
                        save_onsavecallback: self.save,
                        setup: function (editor) {
                            // Add a custom button
                            editor.addButton('news-item-above', {
                                title: 'Add section above this section',
                                image: staticWeb.getAdminPath() + '/img/newsItemAbove.png',
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
                                image: staticWeb.getAdminPath() + '/img/newsItemBelow.png',
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
                }
            });
        },
        save: function (editor) {
            if (editor && editor.startContent) {
                var resourceName = location.pathname.substring(1);
                if (!resourceName || resourceName[resourceName.length - 1] == '/') {
                    resourceName += 'index.html';
                }

                var container = editor.bodyElement;
                var content = container.innerHTML;

                staticWeb.updatePage(container.id, container.tagName, resourceName, content);
            }
        },
        init: function () {
            var self = this;
        }
    }
    staticWeb.components.flowertwigNews = new News();
})(window.StaticWeb);