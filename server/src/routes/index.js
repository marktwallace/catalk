const express = require('express');
const exampleController = require('../controllers/exampleController');
const inviteController = require('../controllers/inviteController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/example', exampleController.getExampleData);
router.post('/create-invite', inviteController.createInvite);
router.post('/accept-invite', inviteController.acceptInvite);
router.post('/login', authController.login);
router.post('/confirm-login', authController.confirmLogin);

module.exports = router;
