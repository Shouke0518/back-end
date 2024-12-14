const mongoose = require('mongoose');

mongoose
    .connect("mongodb+srv://shit141414:ob7WBFD7nZJWC50Q@informationswitch.eghn1.mongodb.net/?retryWrites=true&w=majority&appName=informationSwitch")
    .then(() => console.log('Connected to DB'))
    .catch((err) => console.log(err));
