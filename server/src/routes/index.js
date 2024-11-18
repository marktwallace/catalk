const express = require('express');
const exampleController = require('../controllers/exampleController');
const inviteController = require('../controllers/inviteController');

const router = express.Router();

router.get('/example', exampleController.getExampleData);
router.post('/create-invite', inviteController.createInvite);
router.post('/accept-invite', inviteController.acceptInvite);

module.exports = router;
