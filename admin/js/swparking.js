function parkingPage(storage) {
    var parkings = document.getElementsByClassName('parking');
    for (var i = 0; i < parkings.length; i++) {
        var parking = parkings[i];
        var isFree = parking.className.indexOf('occupied') >= 0;
        updateParking(parking, isFree);
        parking.addEventListener('click', function () {
            var isFree = this.className.indexOf('occupied') >= 0;
            storeParkingUpdate(this, isFree);
            updateParking(this, !isFree);
        });
    }

    changeTextContent();
}

function updateParking(parking, isFree) {
    if (isFree) {
        parking.className = 'parking occupied';
        parking.src = './img/parking-filler-occupied.png';
    } else {
        parking.className = 'parking';
        parking.src = './img/parking-filler-free.png';
    }
    parking.style.display = 'block';
    parking.style.opacity = 0.5;
    parking.style.cursor = 'pointer';
}

function storeParkingUpdate(parking, isFree) {
    self.storage.get('parking.html', function (file, callStatus) {
        if (callStatus.isOK) {
            //alert('file loaded: \r\n' + file.data);
            var data = file.data;
            var regexp = /([^a-z0-9!{}<>/\;&#\:\ \=\\r\\n\\t\"\'\%\*\-\.\,\(\)\@])/gi;
            data = data ? data.replace(regexp, '') : '';

            var cssStatus = isFree ? 'parking' : 'parking occupied';
            var newHtml = '<img src="./img/parking-filler.png" id="' + parking.id + '" class="' + cssStatus + '" />';

            data = data.replace('<img src="./img/parking-filler.png" id="' + parking.id + '" class="parking" />', newHtml);
            data = data.replace('<img src="./img/parking-filler.png" id="' + parking.id + '" class="parking occupied" />', newHtml);

            data = data ? data.replace(regexp, '') : '';
            if (data.indexOf('<meta name="generator" content="StaticWeb" />') == -1) {
                data = data.replace('</head>', '<meta name="generator" content="StaticWeb" /></head>');
            }

            self.storage.set('parking.html', data, function (fileMeta, callStatus) {
                if (callStatus.isOK) {
                    alert('done updating parking');
                } else {
                    alert('fail to update parking, please refresh page');
                }
            });
        }
    });
}