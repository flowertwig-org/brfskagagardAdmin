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
        getApartmentRepo: function (callback) {
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
            // Get tenant names
            var tenents = [];
            for (var tenentIndex = 0; tenentIndex < apartmentInfo.owners.length; tenentIndex++) {
                var tenent = apartmentInfo.owners[tenentIndex];
                tenents.push(tenent.name);
            }

            // Show welcome message with tenent names
            var elements = staticWeb.elements['flowertwig-membertest'];
            for (var index = 0; index < elements.length; index++) {
                var container = elements[index];
                var header = container.children[0];
                if (header.tagName.toLowerCase() == 'h1') {
                    header.textContent = "Välkommen " + tenents.join(' och ') + "!";
                }
                var textElement = container.children[1];
                if (textElement.tagName.toLowerCase() == 'p') {
                    textElement.textContent = "Har inget direkt att visa här, mest tänkt för att visa att det fungerar..";
                }
            }
        },
        onStorageReady: function (storage) {
            var self = this;
            // This method will be called by swadmin.js when storage is ready to be used.
            this.getApartmentRepo(function (repoPath) {
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