const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const commentSchema = new Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, required: true }
});

module.exports = mongoose.model('Comment', commentSchema);
