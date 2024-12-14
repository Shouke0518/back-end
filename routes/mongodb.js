const express = require('express');
var router = express.Router();
const Grocery = require('../database/schemas/Grocery');
const storeGrocery = require('../database/schemas/storeGrocery');
const User = require('../database/schemas/User');
const mongoose = require('mongoose');
const { generateFakeData } = require('../utils/generateFakeData');
const Brute = require('express-brute');

router.use(express.json());


const store = new Brute.MemoryStore();
const bruteforce = new Brute(store, {
    freeRetries: 5,
    minWait: 5 * 60 * 1000,
    maxWait: 60 * 60 * 1000,
    lifetime: 24 * 60 * 60,
});
const bruteForceMiddleware = process.env.BRUTEFORCE_SWITCH === 'true' ? bruteforce.prevent : (req, res, next) => next();

//新增小道消息
router.post('/items', bruteForceMiddleware, async (req, res) => {
    try {
        console.log(req.body);
        const newGrocery = await Grocery.create(req.body);
        res.status(201).json(newGrocery);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/items', async (req, res) => {
    try {
        const grocery = await Grocery.find();
        res.json(grocery);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/userItem/:price/:name/:address', async (req, res) => {
    try {
        const grocery = await storeGrocery.find({
            discountedPrice: req.params.price,
            groceryName: req.params.name,
            storeAddress: req.params.address
        });
        res.json(grocery);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/better/:price/:name', async (req, res) => {
    try {
        const grocery = await storeGrocery.find({
            groceryName: req.params.name,
        });
        const better = grocery.filter((item) => {
            return item.discountedPrice < Number(req.params.price);
        });
        res.json(better);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//商家的資料(網站右邊)
router.get('/items/:name', async (req, res) => {
    try {
        const regex = new RegExp(req.params.name, 'i'); // 'i' 表示不區分大小寫
        const grocery = await storeGrocery.find({ storeName: regex });
        if (!grocery || grocery.length === 0) {
            return res.status(404).json({ message: 'Grocery not found' });
        }
        res.json(grocery);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/items', async (req, res) => {
    try {
        const grocery = await storeGrocery.deleteMany({ expirationDate: { $lt: new Date().toISOString().substring(0, 10) } });
        res.json(grocery);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/items/store', async (req, res) => {
    try {
        const grocery = await storeGrocery.deleteOne({
            storeName: req.body.storeName,
            storeAddress: req.body.storeAddress,
            expirationDate: req.body.expirationDate,
        });
        res.json(grocery);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/items/user', async (req, res) => {
    try {
        const grocery = await Grocery.deleteOne({
            groceryName: req.body.groceryName,
            discountedPrice: req.body.discountedPrice,
            storeAddress: req.body.storeAddress,
        });
        res.json(grocery);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/append', async (req, res) => {
    try {
        const otherConnection = await mongoose.createConnection('mongodb://127.0.0.1:27017/mockStore');
        const OtherDatabaseModel = otherConnection.model('Grocery', storeGrocery.schema);
        const discountedItems = await OtherDatabaseModel.find({ discount: true });

        for (let i = 0; i < discountedItems.length; i++) {
            const itemData = discountedItems[i];

            const cleanedGrocery = {
                groceryName: itemData.groceryName,
                price: itemData.price,
                discount: itemData.discount,
                discountedPrice: itemData.discountedPrice,
                expirationDate: itemData.expirationDate,
                storeName: itemData.storeName,
                storeAddress: itemData.storeAddress
            };
            await storeGrocery.create(cleanedGrocery);
        }

        await otherConnection.close();

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/generate', async (req, res) => {
    try {
        let fakeData = generateFakeData();
        const otherConnection = await mongoose.createConnection('mongodb://127.0.0.1:27017/mockStore');
        const OtherDatabaseModel = otherConnection.model('Grocery', storeGrocery.schema);
        for (let i = 0; i < fakeData.length; i++) {
            await OtherDatabaseModel.create(fakeData[i]);
        }
        await otherConnection.close();
        res.status(201).json(fakeData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/store', async (req, res) => {
    try {
        const inputData = req.body;

        if (!Array.isArray(inputData)) {
            return res.status(400).json({ error: "資料格式錯誤，應為 JSON 陣列。" });
        }

        const otherConnection = await mongoose.createConnection('mongodb://127.0.0.1:27017/mockStore');
        const OtherDatabaseModel = otherConnection.model('Grocery', storeGrocery.schema);

        // 將資料逐筆存入資料庫
        for (const item of inputData) {
            // 可選：新增資料驗證邏輯
            if (
                typeof item.groceryName !== 'string' ||
                typeof item.price !== 'number' ||
                typeof item.discount !== 'boolean' ||
                typeof item.discountedPrice !== 'number' ||
                typeof item.expirationDate !== 'string' ||
                typeof item.storeName !== 'string' ||
                typeof item.storeAddress !== 'string'
            ) {
                throw new Error("資料格式錯誤");
            }

            // 儲存到資料庫
            await OtherDatabaseModel.create(item);
        }

        await otherConnection.close();

        res.sendStatus(201);
    } catch (error) {
        console.error("錯誤:", error.message);
        res.status(500).json({ error: error.message });
    }
});


router.post('/role', async (request, response) => {
    const { email } = request.body;
    const userDB = await User.findOne({ email });
    if (userDB) {
        response.json(userDB.role);
    } else {
        response.send(400);
    }
});

router.post('/user', async (request, response) => {
    const { email } = request.body;
    const userDB = await User.findOne({ email });
    if (userDB) {
        response.json({
            phoneNumber: userDB.phoneNumber,
            name: userDB.name,
            verified: userDB.verified,
        });
    } else {
        response.status(400).send('User not found');
    }
});

module.exports = router;