const express = require('express');
const exampleController = require('../controllers/exampleController');

const router = express.Router();

// Example route
router.get('/example', exampleController.getExampleData);

module.exports = router;
