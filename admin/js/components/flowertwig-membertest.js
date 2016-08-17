// Require GitHub storage provider to work...
(function (staticWeb) {
    "use strict";
    var MemberTest = function () {
        if (!(this instanceof MemberTest)) {
            return new MemberTest();
        }

        return this.init();
    }
    MemberTest.prototype = {
        init: function () {
            var self = this;
        },
        getApartmentRepo: function (storage, callback) {
            var apartmentRepo = localStorage.getItem('brfskagard-member-apartment-repo');
            if (!!apartmentRepo) {
                callback(apartmentRepo);
            } else {
                storage.listStorages(function (repos) {
                    for (var repoIndex = 0; repoIndex < repos.length; repoIndex++) {
                        var currentRepo = repos[repoIndex];
                        // in our test the repo name needs to start with 'brfskagagard-lgh'
                        var isApartmentRepo = currentRepo.name.indexOf('brfskagagard-lgh') === 0;
                        if (isApartmentRepo) {
                            // Storing for faster use next time
                            localStorage.setItem('brfskagard-member-apartment-repo', currentRepo.path);
                            callback(currentRepo.path);
                            return;
                        }
                    }
                    callback(false);
                });
            }
        },
        updateApartmentInfo: function (apartmentInfo) {
            // Show welcome message
            var elements = document.getElementsByClassName('flowertwig-mypages-cta');
            for (var index = 0; index < elements.length; index++) {
                var container = elements[index];
                var header = container.children[0];
                if (!!header && header.tagName.toLowerCase() == 'h1') {
                    header.textContent = "Välkommen!";
                }

                var textElement = container.children[1];
                if (!!textElement && textElement.tagName.toLowerCase() == 'p') {
                    var nOfTenents = apartmentInfo.Owners.length;
                    if (nOfTenents > 1) {
                        textElement.textContent = "Nedan hittar ni först information för er och er lägenhet och längre ner generell information för alla medlemmar.";
                    }else{
                        textElement.textContent = "Nedan hittar du först information för dig och din lägenhet och längre ner generell information för alla medlemmar.";
                    }
                }

                textElement = container.children[2];
                if (!!textElement && textElement.tagName.toLowerCase() == 'p') {
                    container.removeChild(textElement);
                }
            }

            // Adjusting mood image height 
            var ctaContainers = document.getElementsByClassName('mood');
            for (var index = 0; index < ctaContainers.length; index++) {
                var element = ctaContainers[index];
                element.style.height = '250px';
            }            

            var options = document.getElementsByClassName('flowertwig-mypages-options');
            for (var index = 0; index < options.length; index++) {
                var element = options[index];
                element.style.display = 'block';
            }

            this.setTextOnElements('flowertwig-mypages-options-info-building', apartmentInfo.Building);
            this.setTextOnElements('flowertwig-mypages-options-info-apartment', 'Lgh. ' + apartmentInfo.Number);
            this.setTextOnElements('flowertwig-mypages-options-info-size', 'Storlek: ' + apartmentInfo.Size);

            var delivery = [];
            for (var index = 0; index < apartmentInfo.Owners.length; index++) {
                var owner = apartmentInfo.Owners[index];
                for (var index2 = 0; index2 < owner.WayOfInfo.length; index2++) {
                    var way = owner.WayOfInfo[index2];
                    if(delivery.indexOf(way) === -1) {
                        delivery.push(way);
                    }
                }
            }

            this.setTextOnElements('flowertwig-mypages-options-info-delivery', delivery.join(','));
            this.setTextOnElements('flowertwig-mypages-options-info-tenents', 'Boende: ' + apartmentInfo.Owners.length + ' st');
        },
        setTextOnElements: function(className, text) {
            var elements = document.getElementsByClassName(className);
            for (var index = 0; index < elements.length; index++) {
                var element = elements[index];
                this.setTextForElement(element, text);
            }
        },
        setTextForElement: function(element, text) {
            element.innerText = text;
        },
        onStorageReady: function (storage, permissions) {
            var self = this;
            if (!staticWeb.config.permissions.check || permissions.indexOf('member') > 0) {
                self.createInterface(storage, permissions);
            }
        },
        createInterface: function (storage, permissions) {
            var self = this;

            // This method will be called by swadmin.js when storage is ready to be used.
            this.getApartmentRepo(storage, function (repoPath) {
                // Check if we have a valid repo path
                if (!!repoPath) {
                    storage.get(
                        'apartment.json',
                        function (info, status) {
                            if (status.isOK) {
                                // Get apartment info
                                var apartmentInfo = JSON.parse(info.data);
                                self.updateApartmentInfo(apartmentInfo)
                            }
                        },
                        { 'repo': repoPath }
                    );
                } else {
                    // TODO: update view to user, invalid access...
                }
            });
        }
    },
        staticWeb.components.flowertwigMemberTest = new MemberTest();
})(window.StaticWeb);