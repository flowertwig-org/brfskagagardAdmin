function changeMood(storage) {
    var moods = document.getElementsByClassName('mood');
    if (moods.length == 1) {
        var mood = moods[0];
        var changeMood = document.createElement('span');
        changeMood.innerHTML = '<a href="#" style="color:#fff;text-decoration:none">Change image</a>';

        changeMood.style.position = 'absolute';
        changeMood.style.zIndex = 10;
        changeMood.style.margin = '20px';
        changeMood.style.padding = '10px';
        //changeMood.style.backgroundColor = '#fff';
        //changeMood.style.border = 'solid 1px lightgrey';
        changeMood.style.backgroundColor = '#2F5575';
        changeMood.style.color = '#fff';
        changeMood.style.borderRadius = '6px';

        mood.appendChild(changeMood);

        changeMood.addEventListener('click', function (event) {
            event.preventDefault();

            changeMood.style.backgroundColor = '#fff';
            changeMood.style.border = 'solid 1px lightgrey';
            changeMood.style.color = '#000';


            if (event.target.innerHTML.indexOf('Change image') >= 0) {
                this.innerHTML = "Loading images ...";
                var container = this;

                storage.list('/img/mood/', function (info, status) {
                    console.log('arg', arguments);
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

            } else if (event.target.innerHTML.indexOf('Save') >= 0) {
                // TODO: store mood image changes
                var resourceName = location.pathname.substring(1);
                storage.get(resourceName, function (fileMeta, callStatus) {
                    if (callStatus.isOK) {
                        var newData = fileMeta.data;

                        var image = mood.style.backgroundImage;
                        var index = image.indexOf('/img/mood');
                        image = '.' + image.substring(index);
                        image = image.substring(0, image.length - 1);

                        newData = newData.replace(mood.getAttribute('data-mood-orginal'), image);

                        if (newData.indexOf('<meta name="generator" content="StaticWeb" />') == -1) {
                            newData = newData.replace('</head>', '<meta name="generator" content="StaticWeb" /></head>');
                        }


                        storage.set(resourceName, newData, function (fileMeta2, callStatus2) {
                            if (callStatus2.isOK) {
                                alert('saved');
                            } else {
                                alert('fail, error code: 1');
                            }
                        });
                    } else {
                        alert('fail, error code: 0');
                    }
                });
            } else {
                if (event.target.tagName.toLowerCase() == 'img') {
                    var index = 0;
                    if (!mood.getAttribute('data-mood-orginal')) {
                        var orgImage = mood.style.backgroundImage;
                        index = orgImage.indexOf('/img/mood');
                        orgImage = orgImage.substring(index);
                        orgImage = orgImage.substring(0, orgImage.length - 1);
                        mood.setAttribute('data-mood-orginal', '.' + orgImage);
                    }

                    var image = event.target.src;
                    index = image.indexOf('/img/mood');
                    image = image.substring(index);
                    orgImage = image.substring(0, image.length - 1);
                    mood.style.backgroundImage = 'url(.' + image + ')';

                    changeMood.style.backgroundColor = '#2F5575';
                    changeMood.style.color = '#fff';
                    changeMood.style.border = '0';
                    changeMood.style.borderRadius = '6px';

                    changeMood.innerHTML = '<a href="#" style="text-decoration:none;color:#fff">Change image</a> | <a href="#" style="text-decoration:none;color:#fff">Save</a>';
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
