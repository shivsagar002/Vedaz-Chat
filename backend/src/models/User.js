const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    socketId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: '',
    },
    hasEverJoined: {
      type: Boolean,
      default: false, // flips to true on first socket connection
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
