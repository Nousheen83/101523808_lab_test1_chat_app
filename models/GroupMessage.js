const mongoose = require('mongoose');

module.exports = mongoose.model('GroupMessage', {
  from_user: String,
  room: String,
  message: String,
  date_sent: String
});
