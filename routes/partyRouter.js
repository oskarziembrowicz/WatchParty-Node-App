const express = require('express');
const partyController = require('../controllers/partyController');

const router = express.Router();

router.route('/').get(partyController.getAllParties);

module.exports = router;
