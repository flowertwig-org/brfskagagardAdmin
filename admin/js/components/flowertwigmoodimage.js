(function (staticWeb) {
    "use strict";
    var MoodImage = function () {
        if (!(this instanceof MoodImage)) {
            return new MoodImage();
        }

        return this.init();
    }
    MoodImage.prototype = {
        save: function (container) {
            var resourceName = location.pathname.substring(1);
            if (!resourceName || resourceName[resourceName.length - 1] == '/') {
                resourceName += 'index.html';
            }

            var image = container.style.backgroundImage;
            var index = image.indexOf('/img/mood');
            image = '.' + image.substring(index);
            image = image.substring(0, image.length - 1);
            container.removeAttribute('data-mood-orginal');
            
            var content = container.outerHTML;
            content = content.replace(container.style.backgroundImage, "url('" + image + "')");
            
            staticWeb.updatePage(container.id, container.tagName, resourceName, content);
        },
        listImages: function (container) {
            container.style.display = 'inline-block';
            container.innerHTML = "Loading images ...";

            staticWeb.storage.list('/img/mood/', function (info, status) {
                container.style.backgroundColor = '#fff';
                container.style.border = 'solid 1px lightgrey';
                container.style.color = '#000';

                if (status.isOK) {
                    var list = arguments[0];
                    var elements = [];
                    for (var i = 0; i < list.length; i++) {
                        list[i]
                        elements.push('<img src="' + list[i].path + '" width="200" title="' + list[i].name + '" style="cursor:pointer" />');
                    }
                    container.innerHTML = elements.join('');
                }
            });
        },
        changeImage: function (event, container) {
            var index = 0;
            if (!container.getAttribute('data-mood-orginal')) {
                var orgImage = container.style.backgroundImage;
                index = orgImage.indexOf('/img/mood');
                orgImage = orgImage.substring(index);
                orgImage = orgImage.substring(0, orgImage.length - 1);
                container.setAttribute('data-mood-orginal', '.' + orgImage);
            }

            var image = event.target.src;
            index = image.indexOf('/img/mood');
            image = image.substring(index);
            orgImage = image.substring(0, image.length - 1);
            container.style.backgroundImage = 'url(.' + image + ')';
        },
        init: function () {
            var self = this;

            var elements = staticWeb.elements['flowertwigmoodimage'];
            for (var index = 0; index < elements.length; index++) {
                var container = elements[index];
                var mood = container.children[0];
                var panel = document.createElement('span');
                panel.style.position = 'absolute';
                panel.style.zIndex = '10';
                panel.style.margin = '20px';
                panel.style.paddingTop = '10px';
                
                var imageArea = document.createElement('span');
                var changeBtn = document.createElement('a');
                var saveBtn = document.createElement('a');
                
                imageArea.style.display = 'inline-block';
                imageArea.style.borderRadius = '6px';
                imageArea.style.padding = '10px';
                imageArea.style.backgroundColor = '#fff';
                imageArea.style.color = '#000';
                imageArea.addEventListener('click', function (event) {
                    event.preventDefault();
                    self.changeImage(event, mood);
                    imageArea.style.display = 'none';
                    changeBtn.style.display = 'inline';
                    saveBtn.style.display = 'inline';
                });

                changeBtn.href = '#';
                changeBtn.text = 'Change image';
                changeBtn.style.color = '#fff';
                changeBtn.style.textDecoration = 'none';
                changeBtn.style.backgroundColor = '#2F5575';
                changeBtn.style.color = '#fff';
                changeBtn.style.borderRadius = '6px';
                changeBtn.style.padding = '10px';
                changeBtn.style.marginRight = '15px';
                changeBtn.addEventListener('click', function (event) {
                    event.preventDefault();
                    changeBtn.style.display = 'none';
                    saveBtn.style.display = 'none';
                    self.listImages(imageArea);
                });

                saveBtn.href = '#';
                saveBtn.text = 'Save';
                saveBtn.style.color = '#fff';
                saveBtn.style.textDecoration = 'none';
                saveBtn.style.backgroundColor = '#2F5575';
                saveBtn.style.color = '#fff';
                saveBtn.style.borderRadius = '6px';
                saveBtn.style.padding = '10px';
                saveBtn.style.display = 'none';
                saveBtn.addEventListener('click', function (event) {
                    event.preventDefault();
                    mood.removeChild(panel);
                    self.save(mood);
                    mood.appendChild(panel);
                });
                
                panel.appendChild(changeBtn);
                panel.appendChild(saveBtn);
                panel.appendChild(imageArea);

                mood.appendChild(panel);
                // this.setupAction(panel, changeBtn);
            }
        },
        setupAction: function (container, changeMoodBtn) {
            var self = this;
            changeMoodBtn.addEventListener('click', function (event) {
                event.preventDefault();

                if (event.target.innerHTML.indexOf('Change image') >= 0) {
                    self.listImages(this);
                } else if (event.target.innerHTML.indexOf('Save') >= 0) {
                    self.save(this);
                } else {
                    if (event.target.tagName.toLowerCase() == 'img') {
                        self.changeImage(this);
                    } else {
                        changeMood.style.backgroundColor = '#2F5575';
                        changeMood.style.color = '#fff';
                        changeMood.style.border = '0';
                        changeMood.style.borderRadius = '6px';

                        changeMood.innerHTML = '<a href="#" style="text-decoration:none;color:#fff">Change image</a>';
                    }
                }
            });
        }
    }
    staticWeb.components.flowertwigMoodImage = new MoodImage();


})(window.StaticWeb);

function changeMood(storage) {
    var moods = document.getElementsByClassName('mood');
    if (moods.length == 1) {
        //         var mood = moods[0];
        //         var changeMood = document.createElement('span');
        //         changeMood.innerHTML = '<a href="#" style="color:#fff;text-decoration:none">Change image</a>';
        // 
        //         changeMood.style.position = 'absolute';
        //         changeMood.style.zIndex = 10;
        //         changeMood.style.margin = '20px';
        //         changeMood.style.padding = '10px';
        //         //changeMood.style.backgroundColor = '#fff';
        //         //changeMood.style.border = 'solid 1px lightgrey';
        //         changeMood.style.backgroundColor = '#2F5575';
        //         changeMood.style.color = '#fff';
        //         changeMood.style.borderRadius = '6px';
        // 
        //         mood.appendChild(changeMood);

        changeMood.addEventListener('click', function (event) {
            event.preventDefault();

            changeMood.style.backgroundColor = '#fff';
            changeMood.style.border = 'solid 1px lightgrey';
            changeMood.style.color = '#000';


            if (event.target.innerHTML.indexOf('Change image') >= 0) {
                //                 this.innerHTML = "Loading images ...";
                //                 var container = this;
                // 
                //                 storage.list('/img/mood/', function (info, status) {
                //                     console.log('arg', arguments);
                //                     if (status.isOK) {
                //                         var list = arguments[0];
                //                         var elements = [];
                //                         for (var i = 0; i < list.length; i++) {
                //                             list[i]
                //                             elements.push('<img src="' + list[i].path + '" width="200" title="' + list[i].name + '" style="cursor:pointer" />');
                //                         }
                //                         container.innerHTML = elements.join('');
                //                     }
                //                 });

            } else if (event.target.innerHTML.indexOf('Save') >= 0) {
                // TODO: store mood image changes
                //                 var resourceName = location.pathname.substring(1);
                //                 storage.get(resourceName, function (fileMeta, callStatus) {
                //                     if (callStatus.isOK) {
                //                         var newData = fileMeta.data;
                // 
                //                         var image = mood.style.backgroundImage;
                //                         var index = image.indexOf('/img/mood');
                //                         image = '.' + image.substring(index);
                //                         image = image.substring(0, image.length - 1);
                // 
                //                         newData = newData.replace(mood.getAttribute('data-mood-orginal'), image);
                // 
                //                         if (newData.indexOf('<meta name="generator" content="StaticWeb" />') == -1) {
                //                             newData = newData.replace('</head>', '<meta name="generator" content="StaticWeb" /></head>');
                //                         }
                // 
                // 
                //                         storage.set(resourceName, newData, function (fileMeta2, callStatus2) {
                //                             if (callStatus2.isOK) {
                //                                 alert('saved');
                //                             } else {
                //                                 alert('fail, error code: 1');
                //                             }
                //                         });
                //                     } else {
                //                         alert('fail, error code: 0');
                //                     }
                //                 });
            } else {
                if (event.target.tagName.toLowerCase() == 'img') {
                    //                     var index = 0;
                    //                     if (!mood.getAttribute('data-mood-orginal')) {
                    //                         var orgImage = mood.style.backgroundImage;
                    //                         index = orgImage.indexOf('/img/mood');
                    //                         orgImage = orgImage.substring(index);
                    //                         orgImage = orgImage.substring(0, orgImage.length - 1);
                    //                         mood.setAttribute('data-mood-orginal', '.' + orgImage);
                    //                     }
                    // 
                    //                     var image = event.target.src;
                    //                     index = image.indexOf('/img/mood');
                    //                     image = image.substring(index);
                    //                     orgImage = image.substring(0, image.length - 1);
                    //                     mood.style.backgroundImage = 'url(.' + image + ')';
                    // 
                    //                     changeMood.style.backgroundColor = '#2F5575';
                    //                     changeMood.style.color = '#fff';
                    //                     changeMood.style.border = '0';
                    //                     changeMood.style.borderRadius = '6px';
                    // 
                    //                     changeMood.innerHTML = '<a href="#" style="text-decoration:none;color:#fff">Change image</a> | <a href="#" style="text-decoration:none;color:#fff">Save</a>';
                } else {
                    //                     changeMood.style.backgroundColor = '#2F5575';
                    //                     changeMood.style.color = '#fff';
                    //                     changeMood.style.border = '0';
                    //                     changeMood.style.borderRadius = '6px';
                    // 
                    //                     changeMood.innerHTML = '<a href="#" style="text-decoration:none;color:#fff">Change image</a>';
                }
            }
        });
    }
}
