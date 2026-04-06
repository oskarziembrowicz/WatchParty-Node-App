const catchAsync = require('../utils/catchAsync');
const Party = require('../models/partyModel');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.getAllParties = catchAsync(async (req, res, next) => {
  const parties = await Party.find();

  res.status(200).json({
    status: 'success',
    data: {
      parties,
    },
  });
});

exports.getParty = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      party,
    },
  });
});

exports.createParty = catchAsync(async (req, res, next) => {
  const party = {
    name: req.body.name,
    description: req.body.description,
    startDate: req.body.startDate,
    isOnline: req.body.isOnline,
    joinLink: req.body.joinLink,
    address: req.body.address,
    movies: req.body.movies,
    authorId: req.user.id,
    participants: [req.user.id],
  };
  const newParty = await Party.create(party);

  res.status(201).json({
    status: 'success',
    data: {
      party: newParty,
    },
  });
});

exports.addMovie = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  // Protect against duplicate movies
  if (!party.movies.includes(req.body.movieId)) {
    party.movies.push(req.body.movieId);
  }
  const updatedParty = await Party.findByIdAndUpdate(req.params.id, party, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

exports.removeMovie = catchAsync(async (req, res, next) => {
  const partyId = req.params.id;
  const { movieId } = req.params;
  const party = await Party.findById(partyId);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  // Protect against removing a movie that is not in the party
  if (!party.movies.includes(req.params.movieId)) {
    return next(new AppError('Movie not found in party', 404));
  }

  party.movies = party.movies.filter((movie) => movie !== movieId);
  const updatedParty = await Party.findByIdAndUpdate(partyId, party, {
    new: true,
  });

  res.status(204).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

exports.addParticipant = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  const { userId } = req.body;
  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (!party.participants.includes(userId)) {
    party.participants.push(userId);
  }
  // Add user to party participants
  const updatedParty = await Party.findByIdAndUpdate(req.params.id, party, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

exports.removeParticipant = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  const { userId } = req.params;
  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  if (!party.participants.includes(userId)) {
    return next(new AppError('User not found in party', 404));
  }

  // Remove user from party participants
  party.participants.pull(userId);
  const updatedParty = await Party.findByIdAndUpdate(req.params.id, party, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

exports.updateParty = catchAsync(async (req, res, next) => {
  const allowedFields = [
    'name',
    'description',
    'startDate',
    'isOnline',
    'joinLink',
  ];

  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  // Only update allowed fields
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      party[field] = req.body[field];
    }
  });

  const updatedParty = await Party.findByIdAndUpdate(req.params.id, party, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

exports.deleteParty = catchAsync(async (req, res, next) => {
  await Party.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.endParty = catchAsync(async (req, res, next) => {
  const party = await Party.findByIdAndUpdate(
    req.params.id,
    { status: 'archived' },
    { new: true },
  );

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      party,
    },
  });
});

exports.addUsefulLink = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  const { link } = req.body;
  if (!link) {
    return next(new AppError('Link is required', 400));
  }

  party.usefulLinks.push(link);
  const updatedParty = await Party.findByIdAndUpdate(req.params.id, party, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

// IMPRESSIONS
exports.getPartyImpressions = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      impressions: party.partyImpressions,
    },
  });
});

exports.addPartyImpression = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  const impression = {
    userId: req.user.id,
    impression: req.body.impression,
  };

  party.partyImpressions.push(impression);
  const updatedParty = await Party.findByIdAndUpdate(req.params.id, party, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

exports.getMovieImpressions = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  const movieImpressions = party.movieImpressions.filter(
    (impression) => impression.movieId === req.params.movieId,
  );

  res.status(200).json({
    status: 'success',
    data: {
      impressions: movieImpressions,
    },
  });
});

exports.addMovieImpression = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  const impression = {
    movieId: req.params.movieId,
    userId: req.user.id,
    impression: req.body.impression,
  };

  party.movieImpressions.push(impression);
  const updatedParty = await Party.findByIdAndUpdate(req.params.id, party, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});
