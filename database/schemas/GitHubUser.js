const mongoose = require('mongoose');

const GitHubUserSchema = new mongoose.Schema({
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

module.exports = mongoose.model('gitHubUsers', GitHubUserSchema);
