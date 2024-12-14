const mongoose = require('mongoose');

const GoogleUserSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
  },
  email: {
    type: String,
  },
  createdAt: {
    type: mongoose.SchemaTypes.Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model('googleUsers', GoogleUserSchema);
