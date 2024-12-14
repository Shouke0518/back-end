const faker = require('faker');

const foodNames = [
    "便當",
    "漢堡",
    "飯糰",
    "三明治",
    "麵包",
];

const storeGroups = {
    "7-11": [
        { name: "7-11富陽", address: "106台北市大安區和平東路三段298號300號1樓" },
        { name: "7-11台大", address: "100台北市中正區林森南路53號55號" },
        { name: "7-11長星", address: "106台北市大安區基隆路三段85號" },
        { name: "7-11台科", address: "106台北市大安區基隆路四段43號" },
    ],
    "全家": [
        { name: "全家和平店", address: "台北市大安區和平東路二段123號" },
        { name: "全家光復店", address: "台北市松山區光復北路200號" },
        { name: "全家仁愛店", address: "台北市大安區仁愛路四段56號" },
        { name: "全家信義店", address: "台北市信義區松高路88號" },
    ],
    "萊爾富": [
        { name: "萊爾富忠孝店", address: "台北市中山區忠孝東路一段12號" },
        { name: "萊爾富松山店", address: "台北市松山區南京東路四段88號" },
        { name: "萊爾富內湖店", address: "台北市內湖區民權東路六段456號" },
        { name: "萊爾富古亭店", address: "台北市大安區羅斯福路二段101號" },
    ],
    "OK": [
        { name: "OK便利店中山店", address: "台北市中山區北安路10號" },
        { name: "OK便利店新生店", address: "台北市中正區新生南路一段20號" },
        { name: "OK便利店民權店", address: "台北市士林區民權西路32號" },
        { name: "OK便利店大直店", address: "台北市中山區明水路80號" },
    ],
    "全聯": [
        { name: "全聯信義店", address: "台北市信義區松仁路100號" },
        { name: "全聯南港店", address: "台北市南港區忠孝東路六段123號" },
        { name: "全聯松山店", address: "台北市松山區八德路三段456號" },
        { name: "全聯內湖店", address: "台北市內湖區康寧路三段789號" },
    ],
};

function generateFakeData() {
    let fakeData = [];
    let brands = ["7-11", "全家", "萊爾富", "OK", "全聯"];
    let count = 1000;
    const selectedStores = brands.flatMap(brand => storeGroups[brand] || []);

    for (let i = 0; i < count; i++) {
        const store = faker.random.arrayElement(selectedStores);
        const price = Math.floor(Math.random() * (200 - 10) + 10);
        const discount = faker.datatype.boolean();
        const discountedPrice = discount
            ? Math.round(price * (Math.random() * (0.9 - 0.1) + 0.1))
            : price;
        const expirationDate = faker.date.future().toISOString().substring(0, 10);

        fakeData.push({
            groceryName: faker.random.arrayElement(foodNames),
            price,
            discount,
            discountedPrice,
            expirationDate,
            storeName: store.name,
            storeAddress: store.address,
        });
    }

    return fakeData;
}

module.exports = {
    generateFakeData,
};
