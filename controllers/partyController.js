const catchAsync = require('../utils/catchAsync');
const Party = require('../models/partyModel');

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
    res.status(404).json({
      status: 'fail',
      message: 'No party found with that id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      party,
    },
  });
});
