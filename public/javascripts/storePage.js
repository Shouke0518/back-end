const storeName = new URLSearchParams(window.location.search).get('storeName');
const url = '/db/items/' + storeName;
fetch(url, {
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
    displayData(data);
}).catch(error => {
    console.error('錯誤:', error);
});

function displayData(data) {
    const dataDisplay = document.getElementById('dataDisplay');
    dataDisplay.innerHTML = '';

    const rowDiv = document.createElement('div');
    rowDiv.className = 'row row-cols-md-2 row-cols-lg-5 row-cols-sm-1 g-2 g-lg-3 m-4';

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `
        <div class='card mb-3 text-center' style='width: 300px;'>
            <div>
                <img src=${displayImg(item.groceryName)} class='food-img' style='max-width: 64px;' alt='...'/>
            </div>
            <div class='item'>
                <p id='${item.storeName}'>商店名稱: ${item.storeName}</p>
                <p>商店地址: 台北市XX區XX路</p>
                <p>商品名: ${item.groceryName}</p>
                <p>折扣價: ${item.discountedPrice}</p>
                <p>過期日期: ${item.expirationDate}</p>
                <button class='btn btn-primary' onclick='addToCart(${JSON.stringify(item)}, this)'>加入購物車</button>
            </div>
        </div>
        `;
        itemDiv.className = 'col'
        rowDiv.appendChild(itemDiv);
        dataDisplay.appendChild(rowDiv);
    });
}

function displayImg(groceryName) {
    if (groceryName == '飯糰') { return 'images/onigiri.png'; }
    else if (groceryName == '麵包') { return 'images/bread.png'; }
    else if (groceryName == '漢堡') { return 'images/burger.png'; }
    else if (groceryName == '三明治') { return 'images/sandwich.png' }
    else if (groceryName == '便當') { return 'images/bento.png'; }
}

document.getElementById('search').addEventListener('input', function (event) {
    let searchValue = event.target.value.trim().toLowerCase();
    let storeElements = document.querySelectorAll('.col');

    storeElements.forEach(function (element) {
        let info = element.textContent;
        element.style.display = info.includes(searchValue) ? '' : 'none';
    });
});


function addToCart(item, button) {
    let cart;

    try {
        const storedCart = localStorage.getItem('cart');
        cart = storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
        console.error("Failed to parse JSON from localStorage:", e);
        cart = [];
    }

    cart.push(item);

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('已加入購物車');

    const card = button.closest('.col');
    deleteItemFromDB(item, card);
}

function deleteItemFromDB(item, card) {
    console.log(item);
    const url = `/db/items/temp`;
    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('刪除失敗');
        }
    }).then(data => {
        console.log('刪除成功:', data);
        card.remove();
    }).catch(error => {
        console.error('錯誤:', error);
    });
}