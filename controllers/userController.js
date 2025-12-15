const User = require('../models/userModel');
const Party = require('../models/partyModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
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
  const { username, email } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      username,
      email,
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.getUserParties = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('parties');
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  const { parties } = user;

  res.status(200).json({
    status: 'success',
    data: {
      parties,
    },
  });
});

exports.getMyParties = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('parties');
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  const { parties } = user;

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
