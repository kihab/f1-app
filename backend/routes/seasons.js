/**
 * @openapi
 * /api/seasons:
 *   get:
 *     summary: Retrieve all seasons with their champions
 *     tags:
 *       - Seasons
 *     responses:
 *       '200':
 *         description: A JSON array of seasons.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   year:
 *                     type: integer
 *                     example: 2023
 *                   champion:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Max Verstappen"
 *                       driverRef:
 *                         type: string
 *                         example: "max_verstappen"
 */

// routes/seasons.js
const express = require('express');
const router = express.Router();
const seasonsController = require('../controllers/seasonsController');

router.get('/', seasonsController.getSeasons);

module.exports = router;
