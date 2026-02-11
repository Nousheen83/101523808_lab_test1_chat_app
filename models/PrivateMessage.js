const mongoose = require('mongoose');

module.exports = mongoose.model('PrivateMessage', {
  from_user: String,
  to_user: String,
  message: String,
  date_sent: String
});
