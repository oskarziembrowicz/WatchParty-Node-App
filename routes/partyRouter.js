const express = require('express');
const partyController = require('../controllers/partyController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(partyController.getAllParties)
  .post(partyController.createParty);
router
  .route('/:id')
  .get(partyController.getParty)
  .patch(partyController.updateParty)
  .delete(partyController.deleteParty);
router.route('/:id/end').patch(partyController.endParty);
router.route('/:id/movies').patch(partyController.addMovie);
router.route('/:id/movies/:movieId').delete(partyController.removeMovie);
router.route('/:id/participants').patch(partyController.addParticipant);
router
  .route('/:id/participants/:userId')
  .delete(partyController.removeParticipant);

// IMPRESSIONS
router
  .route('/:id/impressions')
  .get(partyController.getPartyImpressions)
  .post(partyController.addPartyImpression);
router
  .route('/:id/movies/:movieId/impressions')
  .get(partyController.getMovieImpressions)
  .post(partyController.addMovieImpression);

module.exports = router;
