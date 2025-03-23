const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');

router.post('/calls', callController.triggerCall);
router.get('/calls', callController.listCallLogs);

module.exports = router;
