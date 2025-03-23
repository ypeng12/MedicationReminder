const twilioService = require('../services/twilioService');
const ttsService = require('../services/ttsService');

const logs = [];

exports.triggerCall = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: "phoneNumber required" });

  await ttsService.synthesizeSpeech();

  const callSid = await twilioService.startCall(phoneNumber);
  logs.push({ sid: callSid, number: phoneNumber, status: 'initiated', transcript: null });

  res.json({ success: true, callSid });
};

exports.listCallLogs = (req, res) => {
  res.json(logs);
};

exports.logs = logs; // For shared access
