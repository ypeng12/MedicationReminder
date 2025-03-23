const express = require('express');
const router = express.Router();
const twilioController = require('../controllers/twilioController');

router.post('/voice', twilioController.handleVoice);
router.post('/status', twilioController.handleStatusCallback);
router.post('/recording-complete', twilioController.handleRecordingComplete);
router.post('/incoming', twilioController.handleIncomingCall);

module.exports = router;
