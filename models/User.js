const mongoose = require('mongoose');

module.exports = mongoose.model('User', {
  username: { type:String, unique:true },
  firstname: String,
  lastname: String,
  password: String,
  createon: String
});
