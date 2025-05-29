// scripts/seedSeasons.js
const { getAllSeasons } = require('../services/seasonsService');

getAllSeasons()
  .then(() => {
    console.log('Seasons seeding completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seasons seeding failed:', err);
    process.exit(1);
  });
