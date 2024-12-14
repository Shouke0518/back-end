const params = new URLSearchParams(window.location.search);
const data = {
    imageUrl: decodeURIComponent(params.get('imgSrc')),
    groceryName: decodeURIComponent(params.get('productName')),
    discountedPrice: decodeURIComponent(params.get('price')),
    storeAddress: decodeURIComponent(params.get('storeAddress'))
};
const url = '/db/userItem/' + data.discountedPrice + "/" + data.groceryName + "/" + data.storeAddress;
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
    var productHTML = `
    <h1>商品詳情</h1>
    <div class="detail">
        <p>商品名稱: ${data[0].groceryName}</p>
        <p>原價: ${data[0].originalPrice}</p>
        <p>折扣: ${data[0].discount}</p>
        <p>折後價: ${data[0].discountedPrice}</p>
        <p>過期日期: ${data[0].expirationDate}</p>
        <p>商店名稱: ${data[0].storeName}</p>
        <p>商店地址: ${data[0].storeAddress}</p>
    </div>
    <img src=${data[0].imageUrl} alt="商品圖片">
    <p>添加者: ${data[0].addedBy}</p>
    <p>添加時間: ${data[0].createdAt.substring(0, 10)}</p>
    <button onclick="showPopup()" class="btn btn-outline-success">買</button>
    `;
    var productDetailsContainer = document.getElementById("productDetails");

    productDetailsContainer.innerHTML = productHTML;
}).catch(error => {
    console.error('錯誤:', error);
});

function showPopup() {
    var width = 600;
    var height = 400;
    var left = (window.innerWidth - width) / 2;
    var top = (window.innerHeight - height) / 2;
    var options = "width=" + width + ",height=" + height + ",left=" + left + ",top=" + top;
    window.open("payPage.html", "_blank", options);
}