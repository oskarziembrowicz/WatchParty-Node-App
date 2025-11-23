const express = require('express');
const partyController = require('../controllers/partyController');

const router = express.Router();

router.route('/').get(partyController.getAllParties);
router.route('/:id').get(partyController.getParty);
router.route('/:id/movies').patch(partyController.addMovie);

module.exports = router;
