/**
 * @openapi
 * /api/seasons/{year}/races:
 *   get:
 *     summary: Retrieve all races for a given season
 *     tags:
 *       - Races
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2025
 *         description: Season year to retrieve races for
 *     responses:
 *       '200':
 *         description: A JSON array of races for that season.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   round:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Australian Grand Prix"
 *                   isChampion:
 *                     type: boolean
 *                     example: true
 *                   winner:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 4
 *                       name:
 *                         type: string
 *                         example: "Lando Norris"
 *                       driverRef:
 *                         type: string
 *                         example: "norris"
 */

// routes/races.js
// ------------------------------------------------------------

const express = require('express');
const router = express.Router({ mergeParams: true });
const { getRaces } = require('../controllers/racesController');

// GET /api/seasons/:year/races
router.get('/', getRaces);

module.exports = router;
