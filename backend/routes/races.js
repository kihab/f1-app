// routes/races.js
// ------------------------------------------------------------

const express = require('express');
const router = express.Router({ mergeParams: true });
const { getRaces } = require('../controllers/racesController');

// GET /api/seasons/:year/races
router.get('/', getRaces);

module.exports = router;
