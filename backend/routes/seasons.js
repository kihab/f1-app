// routes/seasons.js
const express = require('express');
const router = express.Router();
const seasonsController = require('../controllers/seasonsController');

router.get('/', seasonsController.getSeasons);

module.exports = router;
