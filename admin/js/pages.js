
function newsPage(storage) {
    includeScript("//tinymce.cachefly.net/4.2/tinymce.min.js");
    ensureLoaded('tinymce', window, function () {
        tinymce.init({
            selector: ".sw-editable",
            inline: true,
            menubar: false,
            browser_spellcheck: true,
            plugins: "save",
            toolbar: "save | news-item-above news-item-below bold italic | bullist numlist outdent indent | link image",
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
                    image: './admin/img/newsItemBelow.png',
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
    });

    changeMood(storage);
}

function defaultPage(storage) {
    changeTextContent();
    changeMood(storage);
    changeNavigation(storage);
}

function storeDefaultPage(editor) {
    if (editor && editor.startContent) {
        var regexp = /([^a-z0-9!{}<>/\;&#\:\ \=\\r\\n\\t\"\'\%\*\-\.\,\(\)\@])/gi;
        var resourceName = location.pathname.substring(1);

        var container = editor.bodyElement;
        var content = container.innerHTML;
        content = encodetoHtml(content);
        content = content.replace(regexp, '');

        self.storage.get(resourceName, function (file, callStatus) {
            if (callStatus.isOK) {
                //alert('file loaded: \r\n' + file.data);
                var data = file.data;
                data = data ? data.replace(regexp, '') : '';

                var index = data.indexOf('id="' + container.id + '"');
                index = data.indexOf('>', index);
                index++;


                var tagName = container.tagName.toLowerCase();
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

                    self.storage.set(resourceName, newData, function (fileMeta, callStatus) {
                        if (callStatus.isOK) {
                            alert('saved');
                        } else {
                            alert('fail, error code: 1');
                        }
                    });

                } else {
                    alert('fail, error code: 2');
                    console.log('no match');
                }
            }
        });
    }
}
