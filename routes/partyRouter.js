const express = require('express');
const partyController = require('../controllers/partyController');

const router = express.Router();

router
  .route('/')
  .get(partyController.getAllParties)
  .post(partyController.createParty);
router.route('/:id').get(partyController.getParty);
router.route('/:id/movies').patch(partyController.addMovie);
router.route('/:id/movies/:movieId').delete(partyController.removeMovie);

module.exports = router;
