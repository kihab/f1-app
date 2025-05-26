/**
 * @openapi
 * /api/seasons:
 *   get:
 *     summary: Retrieve all seasons with their champions
 *     tags:
 *       - Seasons
 *     responses:
 *       '200':
 *         description: A list of Formula 1 seasons with champion drivers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 2023
 *                         description: Formula 1 season year
 *                       champion:
 *                         type: object
 *                         nullable: true
 *                         description: Champion driver details (null if season not concluded)
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                             description: Driver ID in the database
 *                           name:
 *                             type: string
 *                             example: "Max Verstappen"
 *                             description: Driver's full name
 *                           driverRef:
 *                             type: string
 *                             example: "max_verstappen"
 *                             description: Driver's reference ID in Ergast API
 *                           nationality:
 *                             type: string
 *                             example: "Dutch"
 *                             description: Driver's nationality
 *                 message:
 *                   type: string
 *                   nullable: true
 *                   description: Optional message, provided when the data array is empty
 *                   example: "No season data available. Our systems may be experiencing temporary issues."
 */

// routes/seasons.js
const express = require('express');
const router = express.Router();
const seasonsController = require('../controllers/seasonsController');

router.get('/', seasonsController.getSeasons);

module.exports = router;
