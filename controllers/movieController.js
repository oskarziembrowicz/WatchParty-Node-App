const dotenv = require('dotenv');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

dotenv.config();
const omdbURL = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&`;

const isValidImdbId = (id) => /^tt\d{7,10}$/.test(id);

exports.getAllMovies = catchAsync(async (req, res, next) => {
  const response = await fetch(`${omdbURL}t=${req.query.title}`);
  const data = await response.json();

  if (data.Error) {
    return next(new AppError(data.Error, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      result: data,
    },
  });
});

exports.getMovieById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidImdbId(id)) {
    return next(new AppError('Invalid IMDb ID format', 400));
  }

  const response = await fetch(`${omdbURL}i=${id}`);
  const data = await response.json();

  if (data.Error) {
    return next(new AppError(data.Error, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      movie: data,
    },
  });
});
