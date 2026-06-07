const express = require('express');
const movieController = require('../controllers/movieController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.route('/').get(movieController.getAllMovies);
router.route('/:id').get(movieController.getMovieById);

module.exports = router;
