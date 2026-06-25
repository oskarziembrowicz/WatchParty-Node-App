const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'A user must have a username'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'A user must have an email'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    savedMovies: {
      type: [String],
      default: [],
    },
    friends: {
      type: [mongoose.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

userSchema.pre('save', async function (next) {
  // Only hash the password if is new or modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
