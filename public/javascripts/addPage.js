let map, geocoder, infowindow;
let address = "";

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 14,
    });
    geocoder = new google.maps.Geocoder();
    infowindow = new google.maps.InfoWindow();
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
}

function panToCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setZoom(14);
                const marker = new google.maps.Marker({
                    position: pos,
                    map: map,
                });
                map.setCenter(pos);
                geocodePosition(pos);
            },
            () => {
                handleLocationError(true, infowindow, map.getCenter());
            }
        );
    } else {
        window.alert("您的瀏覽器不支援地理定位。");
    }
}

function geocodePosition(pos) {
    geocoder.geocode({ location: pos })
        .then((response) => {
            if (response.results[0]) {
                address = response.results[0].formatted_address;
                infowindow.setContent(address);
                infowindow.setPosition(pos);
                infowindow.open(map);
            } else {
                window.alert("未找到结果。");
            }
        })
        .catch((error) => {
            window.alert(error);
        });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation ? "錯誤：地理定位服務失敗。" : "錯誤：您的瀏覽器不支援地理定位。"
    );
    infoWindow.open(map);
}

window.initMap = initMap;

function handleAddForm(event) {
    event.preventDefault();

    getImageUrl(event, function (url, error) {
        if (error) {
            console.error('上傳圖片失敗:', error);
            return;
        }

        const { value: groceryName } = document.getElementById("groceryName");
        const { value: originalPrice } = document.getElementById("originalPrice");
        const { value: discount } = document.getElementById("discount");
        const { value: expirationDate } = document.getElementById("expirationDate");
        const { value: storeName } = document.getElementById("storeName");
        var addedBy = localStorage.getItem('user');

        const formData = {
            groceryName,
            originalPrice,
            discount,
            discountedPrice: originalPrice * parseFloat(discount) / 100,
            expirationDate,
            storeName,
            storeAddress: address,
            imageUrl: url,
            addedBy: addedBy,
        };

        fetch('/db/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        }).then(response => {
            if (response.ok) {
                console.log("新增成功");
                alert("新增成功");
                encrypt(formData);
            } else {
                alert("嘗試次數過多");
            }
        }).catch(error => {
            console.error('錯誤:', error);
        });
    });
}

function encrypt(plaintext) {
    const socket = new WebSocket('ws://localhost:8080');

    fetch('/crypto/encrypt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plaintext: plaintext })
    }).then(response => response.json())
        .then(data => {
            socket.send(JSON.stringify(data));
            window.close();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function getImageUrl(event, callback) {
    const fileInput = event.target.querySelector('input[type="file"]');
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    fetch('/imgur/upload', {
        method: 'POST',
        body: formData
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('上傳圖片失敗');
        }
    }).then(data => {
        console.log("文件已成功上傳，Imgur URL:", data.imgurUrl);
        callback(data.imgurUrl);
    }).catch(error => {
        callback(null, error);
    });
}