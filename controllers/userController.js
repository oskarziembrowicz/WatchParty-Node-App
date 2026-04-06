const User = require('../models/userModel');
const Party = require('../models/partyModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: This returns every user in the database, including their plaintext passwords
  //                and all personal data. In production, restrict to admin role, apply field
  //                projection to exclude sensitive fields, and add pagination.
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: Any authenticated user can look up any other user by ID (IDOR).
  //                In production, restrict to the user themselves or an admin,
  //                and exclude sensitive fields like password from the projection.
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.getMyData = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // Only allow updating "username" and "email"
  const allowedFields = ['username', 'email'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  // SECURITY NOTE: Any authenticated user can update any other user's data (IDOR / broken access control).
  //                In production, restrict this endpoint to admins, or verify req.user.id === userId.
  const allowedFields = ['username', 'email'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
  });

  if (!updatedUser) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: In production, consider soft-deleting (setting an `active: false` flag)
  //                instead of hard-deleting, so cascading cleanup (parties, friends lists) can be handled.
  await User.findByIdAndDelete(req.user.id);

  res.clearCookie('jwt');

  res.status(204).json({
    status: 'success',
    data: {},
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: Any authenticated user can delete any other user (IDOR / broken access control).
  //                In production, restrict this endpoint to admins only.
  await User.findByIdAndDelete(req.params.id);

  // If deleting myself
  if (req.user.id === req.params.id) res.clearCookie('jwt');

  res.status(204).json({
    status: 'success',
    data: {},
  });
});

exports.getUserParties = catchAsync(async (req, res, next) => {
  const parties = await Party.find({ participants: req.params.id });

  res.status(200).json({
    status: 'success',
    data: {
      parties,
    },
  });
});

exports.getMyParties = catchAsync(async (req, res, next) => {
  const parties = await Party.find({ participants: req.user.id });

  res.status(200).json({
    status: 'success',
    data: {
      parties,
    },
  });
});

exports.getMyHostedParties = catchAsync(async (req, res, next) => {
  const hostedParties = await Party.find({ authorId: req.user.id });

  res.status(200).json({
    status: 'success',
    data: {
      hostedParties,
    },
  });
});

exports.getMyArchivedParties = catchAsync(async (req, res, next) => {
  const archivedParties = await Party.find({
    participants: req.user.id,
    status: 'archived',
  });

  res.status(200).json({
    status: 'success',
    data: {
      archivedParties,
    },
  });
});

exports.getHostedParties = catchAsync(async (req, res, next) => {
  const hostedParties = await Party.find({ authorId: req.params.id });

  res.status(200).json({
    status: 'success',
    data: {
      hostedParties,
    },
  });
});

exports.saveMovie = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  const { movieId } = req.body;

  // Add movie to user movies
  if (!user.savedMovies.includes(movieId)) {
    user.savedMovies.push(movieId);
  }
  const updatedUser = await User.findByIdAndUpdate(req.user.id, user, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.removeMovie = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  const movieId = req.params.id;

  // Remove movie from savedMovies
  if (!user.savedMovies.includes(movieId)) {
    return next(new AppError('That movie is not saved by this user', 404));
  }
  user.savedMovies = user.savedMovies.filter((movie) => movie !== movieId);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, user, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.addFriend = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  const { friendId } = req.body;

  // SECURITY NOTE: There is no check that `friendId` refers to an existing user; an invalid ObjectId
  //                would silently be stored. In production, verify the friend exists before adding.
  // SECURITY NOTE: Friend relationships are one-directional here. In production, consider requiring
  //                mutual consent (friend request / accept pattern) to prevent harassment.
  // Add user to friends list
  if (user.friends.includes(friendId)) {
    return next(new AppError('That user is already your friend', 401));
  }
  user.friends.push(friendId);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, user, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.removeFriend = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  const friendId = req.params.id;

  const unfriendedUser = await User.findById(friendId);
  if (!unfriendedUser) {
    return next(new AppError('No user found with that friend ID', 404));
  }

  // Remove user from friends
  if (!user.friends.includes(friendId)) {
    return next(new AppError('That user is not on friends list', 404));
  }
  user.friends.pull(friendId);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, user, {
    new: true,
  });

  // Remove this user from another users friends
  unfriendedUser.friends.pull(req.user.id);
  await User.findByIdAndUpdate(friendId, unfriendedUser);

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});
