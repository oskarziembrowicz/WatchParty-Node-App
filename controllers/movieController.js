const dotenv = require('dotenv');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

dotenv.config();
// SECURITY NOTE: The API key is embedded in a URL, which means it will appear in server access logs
//                and any network monitoring tools. In production, pass the key as a header instead.
const omdbURL = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&`;

exports.getAllMovies = catchAsync(async (req, res, next) => {
  // fetch('https://api.trakt.tv', {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'User-Agent': 'WatchParty/1.0.0',
  //     'trakt-api-key': process.env.TRAKT_API_KEY,
  //     'trakt-api-version': 2,
  //   },
  // }).then((response) => console.log(response));

  // SECURITY NOTE: req.query.title is passed to an external service without sanitization.
  //                In production, validate and sanitize query parameters before forwarding them.
  // SECURITY NOTE: There is no response caching; every request hits the external API, which may
  //                exhaust rate limits or quotas. In production, add a caching layer (e.g. Redis).
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
  // SECURITY NOTE: req.params.id is passed to an external service without validation.
  //                In production, validate the format (e.g. IMDb IDs match /^tt\d+$/) before forwarding.
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
