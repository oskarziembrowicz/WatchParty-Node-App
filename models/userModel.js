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
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      // select: false, // TODO: Don't return password by default
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
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    parties: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Party',
      default: [],
    },
    archivedParties: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Party',
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

// TODO: Hash password before saving
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
