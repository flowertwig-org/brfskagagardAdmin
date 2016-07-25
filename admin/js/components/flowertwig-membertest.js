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
        onStorageReady: function () {
            // This method will be called by swadmin.js when storage is ready to be used.
            staticWeb.storage.listStorages(function (repos) {
                for (var repoIndex = 0; repoIndex < repos.length; repoIndex++) {
                    var currentRepo = repos[repoIndex];
                    var isApartmentRepo = currentRepo.name.indexOf('brfskagagard-lgh');
                    if (isApartmentRepo) {
                        staticWeb.storage.get(
                            'swconfig.json',
                            function (info, status) {
                                if (status.isOK) {
                                    // Get apartment info
                                    var apartmentInfo = JSON.parse(info.data);
                                    // Get tenent names
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

                                }
                            },
                            { 'repo': currentRepo.path }
                        );
                    }
                }
            });
        }
    },
        staticWeb.components.flowertwigMemberTest = new MemberTest();
})(window.StaticWeb);