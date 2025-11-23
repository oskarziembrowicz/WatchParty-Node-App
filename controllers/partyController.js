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
