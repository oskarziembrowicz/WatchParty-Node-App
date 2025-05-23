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
