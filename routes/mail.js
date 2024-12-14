const express = require('express');
const router = express.Router();
const app = express();

const { send_mail } = require('../utils/mailSender');

app.use(express.json());

router.post('/send', (req, res) => {
    const { email, message } = req.body;
    send_mail(email, "訂單確認", message);
    res.status(200).send('Email sent successfully');
});

module.exports = router;
