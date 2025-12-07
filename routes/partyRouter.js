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
  .patch(partyController.updateParty);
router.route('/:id/movies').patch(partyController.addMovie);
router.route('/:id/movies/:movieId').delete(partyController.removeMovie);
router.route('/:id/participants').patch(partyController.addParticipant);
router
  .route('/:id/participants/:userId')
  .delete(partyController.removeParticipant);

module.exports = router;
