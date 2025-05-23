const express = require('express');
const movieController = require('../controllers/movieController');

const router = express.Router();

router.route('/').get(movieController.getAllMovies);
router.route('/:id').get(movieController.getMovieById);

module.exports = router;
