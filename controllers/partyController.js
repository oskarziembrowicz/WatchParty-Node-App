const catchAsync = require('../utils/catchAsync');
const Party = require('../models/partyModel');
const AppError = require('../utils/appError');

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
  console.log(req.user);

  const party = {
    name: req.body.name,
    description: req.body.description,
    startDate: req.body.startDate,
    isOnline: req.body.isOnline,
    joinLink: req.body.joinLink,
    address: req.body.address,
    movies: req.body.movies,
    authorId: req.user.id,
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
