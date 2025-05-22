const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const omdbURL = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&`;

exports.getAllMovies = (req, res, next) => {
  //   fetch('https://api.trakt.tv', {
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'User-Agent': 'WatchParty/1.0.0',
  //       'trakt-api-key': process.env.TRAKT_API_KEY,
  //       'trakt-api-version': 2,
  //     },
  //   }).then((response) => console.log(response));
  console.log(req.query.title);
  fetch(`${omdbURL}t=${req.query.title}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      res.status(200).json({
        status: 'success',
        data,
      });
    });
};
