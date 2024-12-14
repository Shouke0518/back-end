const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
    name: {
        type: mongoose.SchemaTypes.String
    },
    price: {
        type: mongoose.SchemaTypes.String
    },
});

module.exports = mongoose.model('test', TestSchema);
