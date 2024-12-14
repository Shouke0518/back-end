var pos;
function initMap() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
        });

    const service = new google.maps.DistanceMatrixService();
}

function sortByPrice(input) {
    document.getElementById('sortLabel').textContent = '價格';

    const cardElements = document.querySelectorAll('.card.mb-3');
    const cardArray = Array.from(cardElements);

    const comparePrices = (a, b) => {
        const priceA = parseFloat(a.querySelector('.card-text').textContent);
        const priceB = parseFloat(b.querySelector('.card-text').textContent);
        if (input == 'highToLow') return priceA - priceB;
        return priceB - priceA;
    };

    cardArray.sort(comparePrices);
    const sideBody = document.querySelector('.side-body');
    sideBody.innerHTML = '';
    cardArray.forEach(card => {
        sideBody.appendChild(card);
    });
}

function sortByDistance(input) {
    document.getElementById('sortLabel').textContent = '距離';

    const cardElements = document.querySelectorAll('.card.mb-3');
    const cardArray = Array.from(cardElements);
    const service = new google.maps.DistanceMatrixService();
    let distanceArray = [];

    service.getDistanceMatrix(
        {
            origins: [pos],
            destinations: cardArray.map(card => card.querySelector('.card-footer').textContent),
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
        },
        function (response, status) {
            if (status !== google.maps.DistanceMatrixStatus.OK) {
                window.alert('Error was' + status);
            } else {
                for (let i = 0; i < response.rows[0].elements.length; i++) {
                    distanceArray.push({ "index": i, "value": response.rows[0].elements[i].distance.value })
                }
                const compareDistances = (a, b) => {
                    if (input == 'highToLow') return a.value - b.value;
                    return b.value - a.value;
                };

                distanceArray.sort(compareDistances);
                let sortedArray = distanceArray.map(index => cardArray[index.index]);
                const sideBody = document.querySelector('.side-body');
                sideBody.innerHTML = '';
                sortedArray.forEach(card => {
                    sideBody.appendChild(card);
                });
            }
        }
    );
}

document.getElementById('search').addEventListener('input', function (event) {
    var searchValue = event.target.value.trim().toLowerCase();
    var storeElements = document.querySelectorAll('.wrapper-work');

    storeElements.forEach(function (element) {
        var storeName = element.getAttribute('data-store').toLowerCase();
        element.style.display = storeName.includes(searchValue) ? 'block' : 'none';
    });
});

function logout() {
    fetch('/auth/logout', {
        method: 'POST'
    }).then(response => {
        if (response.ok) {
            console.log("登出成功");
            alert("登出成功");
            localStorage.setItem('role', "guest");
            localStorage.setItem('isLogin', 'no');
            window.location.href = "loginPage.html";
        } else {
            console.log("錯誤");
        }
    }).catch(error => {
        console.error('錯誤:', error);
    });
}

function redirectToStore(storeName) {
    window.location.href = "storePage.html?storeName=" + encodeURIComponent(storeName);
}

function redirectToDetail(data) {
    const params = new URLSearchParams({
        imgSrc: encodeURIComponent(data.imgSrc),
        productName: encodeURIComponent(data.productName),
        price: encodeURIComponent(data.price),
        storeAddress: encodeURIComponent(data.storeAddress)
    }).toString();
    window.open("detailPage.html?" + params, "_blank", "width=600,height=400");
}

function toAddPage() {
    var width = 600;
    var height = 400;
    var left = (window.innerWidth - width) / 2;
    var top = (window.innerHeight - height) / 2;
    var options = "width=" + width + ",height=" + height + ",left=" + left + ",top=" + top;
    window.open("addPage.html", "_blank", options);
}

function getData() {
    fetch('/db/items/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(response => {
        if (response.ok) {
            console.log("成功");
            return response.json();
        } else {
            console.log("錯誤");
            throw new Error('錯誤');
        }
    }).then(data => {
        console.log(data);
    }).catch(error => {
        console.error('錯誤:', error);
    });
}

function showCard(data) {
    var imgSrc = data.imageUrl;
    var productName = data.groceryName;
    var price = data.discountedPrice;
    var storeAddress = data.storeAddress;
    var newCard = document.createElement('div');
    newCard.className = 'card mb-3';
    newCard.style.maxWidth = '600px';

    newCard.onclick = function () {
        redirectToDetail({ imgSrc, productName, price, storeAddress });
    };

    var cardContent = `
            <div class="row g-0">
                <div class="pic col-md-4">
                    <img src="${imgSrc}" class="img-fluid rounded-start" alt="Uploaded Image">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${productName}</h5>
                        <p class="card-text">${price}</p>
                        <p class="card-footer"><small class="text-body-secondary">${storeAddress}</small></p>
                    </div>
                </div>
            </div>
        `;

    newCard.innerHTML = cardContent;

    var cardContainer = document.querySelector('.side-body');
    cardContainer.appendChild(newCard);
}

const socket = new WebSocket('ws://localhost:8080');

socket.onopen = function (event) {
    console.log('WebSocket connection opened.');
};

function decrypt(input) {
    fetch('/crypto/decrypt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
    }).then(response => response.json())
        .then(data => {
            showCard(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

socket.onmessage = function (event) {
    event.data.text().then(function (text) {
        console.log('Received:', JSON.parse(text).ciphertext);
        decrypt(JSON.parse(text))
    }).catch(function (error) {
        console.error('Error converting Blob to text:', error);
    });
};

socket.onclose = function (event) {
    console.log('WebSocket connection closed.');
};

socket.onerror = function (error) {
    console.error('WebSocket error:', error);
};