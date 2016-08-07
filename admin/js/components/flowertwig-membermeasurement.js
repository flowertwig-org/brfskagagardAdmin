// Require GitHub storage provider to work...
(function (staticWeb) {
    "use strict";
    var MemberMeasurement = function () {
        if (!(this instanceof MemberMeasurement)) {
            return new MemberMeasurement();
        }

        return this.init();
    }
    MemberMeasurement.prototype = {
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
        updateMeasurementInfo: function (measurementInfo) {
            var apartmentName = measurementInfo.Number
            document.title = apartmentName;
            this.setTextOnElements('breadcrum-current-node', apartmentName)
            this.setTextOnElements('apartment-number', apartmentName)
            this.setTextOnElements('measurementMonthName', measurementInfo.TopHeader);
            // this.setTextOnElements('measurementWarmWaterConsumption', measurementInfo.TopWarmwater.Text);

            var elements = document.getElementsByClassName('measurement-warmwater');
            this.updatePieInfo(elements, measurementInfo.TopWarmwater.Text, measurementInfo.TopWarmwater.Rotation, measurementInfo.TopWarmwater.IsBig);

            var elements = document.getElementsByClassName('measurement-heat');
            this.updatePieInfo(elements, measurementInfo.TopHeat.Text, measurementInfo.TopHeat.Rotation, measurementInfo.TopHeat.IsBig);

            var elements = document.getElementsByClassName('measurement-cost');
            this.updateCostPieInfo(elements, measurementInfo.TopCost.Text, measurementInfo.TopCost.Rotation, measurementInfo.TopCost.IsBig, measurementInfo.TopCost.IsOver);

            var elements = document.getElementsByClassName('measurement-warmwater-similar');
            this.updatePieInfo(elements, measurementInfo.SimilarWarmwater.Text, measurementInfo.SimilarWarmwater.Rotation, measurementInfo.SimilarWarmwater.IsBig);

            var elements = document.getElementsByClassName('measurement-heat-similar');
            this.updatePieInfo(elements, measurementInfo.SimilarHeat.Text, measurementInfo.SimilarHeat.Rotation, measurementInfo.SimilarHeat.IsBig);

            var elements = document.getElementsByClassName('measurement-warmwater-building');
            this.updatePieInfo(elements, measurementInfo.BuildingWarmwater.Text, measurementInfo.BuildingWarmwater.Rotation, measurementInfo.BuildingWarmwater.IsBig);

            var elements = document.getElementsByClassName('measurement-heat-building');
            this.updatePieInfo(elements, measurementInfo.BuildingHeat.Text, measurementInfo.BuildingHeat.Rotation, measurementInfo.BuildingHeat.IsBig);

            this.setTextOnElements('username', measurementInfo.LoginInfo.UserName);
            this.setTextOnElements('password', measurementInfo.LoginInfo.Password);
        },
        updatePieInfo: function (elements, text, degre, isBig) {
            for (var index = 0; index < elements.length; index++) {
                var pieElement = elements[index];
                var filler = pieElement.querySelector('.flowertwig-pie-piece-small-filler');
                filler.style.transform = 'rotate(' + degre + 'deg)';
                filler.alt = text;

                var bigPiece = pieElement.querySelector('.flowertwig-pie-piece-big');

                if (!isBig) {
                    filler.src = '/img/graph-color-01.png';
                    bigPiece.src = '/img/graph-color-03b.png';
                } else {
                    filler.src = '/img/graph-color-03b.png';
                    bigPiece.src = '/img/graph-color-01.png';
                }

                var textPlate = pieElement.querySelector('.measurement-value');
                textPlate.innerText = text;
            }
        },
        updateCostPieInfo: function (elements, text, degre, isBig, isOver) {
            for (var index = 0; index < elements.length; index++) {
                var pieElement = elements[index];
                var filler = pieElement.querySelector('.flowertwig-pie-piece-small-filler');
                filler.style.transform = 'rotate(' + degre + 'deg)';
                filler.alt = text;

                var bigPiece = pieElement.querySelector('.flowertwig-pie-piece-big');

                if (isOver) {
                    if (isBig) {
                        filler.src = '/img/graph-color-04b.png';
                        bigPiece.src = '/img/graph-color-05.png';
                    } else {
                        filler.src = '/img/graph-color-05.png';
                        bigPiece.src = '/img/graph-color-04b.png';
                    }
                } else {
                    if (isBig) {
                        filler.src = '/img/graph-color-06.png';
                        bigPiece.src = '/img/graph-color-04b.png';
                    } else {
                        filler.src = '/img/graph-color-04b.png';
                        bigPiece.src = '/img/graph-color-06.png';
                    }
                }

                var textPlate = pieElement.querySelector('.measurement-value');
                textPlate.innerText = text;
            }
        },
        setTextOnElements: function (className, text) {
            var elements = document.getElementsByClassName(className);
            for (var index = 0; index < elements.length; index++) {
                var element = elements[index];
                this.setTextForElement(element, text);
            }
        },
        setTextForElement: function (element, text) {
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
                        'minol-apartment-report-last-month.json',
                        function (info, status) {
                            if (status.isOK) {
                                // Get apartment info
                                var measurementInfo = JSON.parse(info.data);
                                self.updateMeasurementInfo(measurementInfo)
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
        staticWeb.components.flowertwigMemberMeasurement = new MemberMeasurement();
})(window.StaticWeb);