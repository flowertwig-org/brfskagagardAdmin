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
            var elements = staticWeb.elements['flowertwig-membertest'];
            for (var index = 0; index < elements.length; index++) {
                var container = elements[index];
                var header = container.children[0];
                if (header.tagName.toLowerCase() == 'h1') {
                    header.textContent = "Välkommen!";
                }

                var textElement = container.children[1];
                if (textElement.tagName.toLowerCase() == 'p') {
                    textElement.textContent = "Nedan hittar du först information för dig och din lägenhet och längre ner generell information för alla medlemmar.";
                }

                textElement = container.children[2];
                if (textElement.tagName.toLowerCase() == 'p') {
                    container.removeChild(textElement);
                }
            }
        },
        onStorageReady: function (storage) {
            var self = this;
            // This method will be called by swadmin.js when storage is ready to be used.
            this.getApartmentRepo(storage, function (repoPath) {
                // Check if we have a valid repo path
                if (!!repoPath) {
                    storage.get(
                        'swconfig.json',
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