const mongoose = require('mongoose');

const GrocerySchema = new mongoose.Schema({
    groceryName: {
        type: mongoose.SchemaTypes.String
    },
    price: {
        type: mongoose.SchemaTypes.String
    },
    discount: {
        type: mongoose.SchemaTypes.Boolean
    },
    discountedPrice: {
        type: mongoose.SchemaTypes.String
    },
    expirationDate: {
        type: mongoose.SchemaTypes.String
    },
    storeName: {
        type: mongoose.SchemaTypes.String
    },
    storeAddress: {
        type: mongoose.SchemaTypes.String
    },
});
module.exports = mongoose.model('storeGrocery', GrocerySchema);
