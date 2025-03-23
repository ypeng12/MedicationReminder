const { logs } = require('./callController');
const { transcribeRecording } = require('../services/sttService');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const twilioService = require('../services/twilioService');

exports.handleVoice = (req, res) => {
  const response = new VoiceResponse();
  if (req.body.AnsweredBy === 'machine') {
    response.play(`${process.env.BASE_URL}/audio/voicemail.mp3`);
    response.hangup();
  } else {
    response.play(`${process.env.BASE_URL}/audio/message.mp3`);
    response.record({
      action: '/recording-complete',
      maxLength: 10,
      playBeep: true,
    });
    response.say('Thank you. Goodbye.');
  }
  res.type('text/xml').send(response.toString());
};

exports.handleRecordingComplete = async (req, res) => {
  const { CallSid, RecordingUrl } = req.body;
  const transcript = await transcribeRecording(RecordingUrl);
  const log = logs.find(l => l.sid === CallSid);
  if (log) {
    log.status = 'answered';
    log.transcript = transcript;
  }
  console.log(`Call SID: ${CallSid}, Status: answered, Response: "${transcript}"`);
  res.sendStatus(200);
};

exports.handleStatusCallback = async (req, res) => {
  const { CallSid, CallStatus, AnsweredBy, To } = req.body;
  const log = logs.find(l => l.sid === CallSid);

  if (CallStatus === 'no-answer' || CallStatus === 'busy') {
    await twilioService.sendSMS(To);
    if (log) log.status = 'sms_sent';
    console.log(`Call SID: ${CallSid}, Status: SMS sent`);
  } else if (AnsweredBy === 'machine') {
    if (log) log.status = 'voicemail';
    console.log(`Call SID: ${CallSid}, Status: voicemail left`);
  }
  res.sendStatus(200);
};

exports.handleIncomingCall = (req, res) => {
  const response = new VoiceResponse();
  response.play(`${process.env.BASE_URL}/audio/message.mp3`);
  response.record({
    action: '/recording-complete',
    maxLength: 10,
    playBeep: true,
  });
  response.say('Thank you. Goodbye.');
  res.type('text/xml').send(response.toString());
};
