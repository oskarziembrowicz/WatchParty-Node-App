const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

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
      // SECURITY NOTE: In production, add `match: [/regex/, 'Invalid email']` to validate email format
      //                and prevent storing malformed addresses that could cause issues downstream.
    },
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      // minlength: [8, 'Password must be at least 8 characters'],
      // SECURITY NOTE: In production, uncomment the line below so the password is never returned
      //                in queries by default, reducing accidental password exposure.
      // select: false,
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

// SECURITY NOTE: In production, hash the password before saving using a pre-save hook with bcrypt.
//                Storing plaintext passwords means a database leak immediately exposes all credentials.
// userSchema.pre('save', async function(next) {
//   // Only hash the password if it has been modified (or is new)
//   if (!this.isModified('password')) return next();

//   // Hash the password with cost of 12
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // Instance method to compare passwords
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

const User = mongoose.model('User', userSchema);

module.exports = User;
