const dotenv = require('dotenv');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

dotenv.config({ path: './config.env' });
const omdbURL = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&`;

exports.getAllMovies = catchAsync(async (req, res, next) => {
  //   fetch('https://api.trakt.tv', {
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'User-Agent': 'WatchParty/1.0.0',
  //       'trakt-api-key': process.env.TRAKT_API_KEY,
  //       'trakt-api-version': 2,
  //     },
  //   }).then((response) => console.log(response));
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
  const response = await fetch(`${omdbURL}i=${req.params.id}`);
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
