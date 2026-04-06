const express = require('express');
const movieController = require('../controllers/movieController');

// SECURITY NOTE: Movie routes are public -- there is no authController.protect middleware here.
//                In production, add authentication so only logged-in users can search for movies.
const router = express.Router();

router.route('/').get(movieController.getAllMovies);
router.route('/:id').get(movieController.getMovieById);

module.exports = router;
