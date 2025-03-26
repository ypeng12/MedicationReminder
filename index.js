require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  DEEPGRAM_API_KEY,
  ELEVENLABS_API_KEY,
  ELEVENLABS_VOICE_ID,
  PUBLIC_URL
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error("Missing Twilio credentials.");
  process.exit(1);
}
if (!DEEPGRAM_API_KEY || !ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
  console.error("Missing Deepgram/ElevenLabs keys.");
  process.exit(1);
}
if (!PUBLIC_URL) {
  console.error("Missing PUBLIC_URL.");
  process.exit(1);
}

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const audioDir = path.join(__dirname, 'audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);
app.use('/audio', express.static(audioDir));

const callLogs = [];
const answeredCallSids = new Set();

const reminderMessage = "Hello, this is a reminder from your healthcare provider to confirm your medications for the day. Please confirm if you have taken your Aspirin, Cardivol, and Metformin today.";
const smsMessage = "We called to check on your medication but couldn't reach you. Please call us back or take your medications if you haven't done so.";

// Generate reminder audio using ElevenLabs
async function generateTTS(text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;
  const response = await axios.post(url, { text }, {
    headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    responseType: 'arraybuffer'
  });
  const filePath = path.join(audioDir, 'reminder.mp3');
  fs.writeFileSync(filePath, response.data);
  return `${PUBLIC_URL}/audio/reminder.mp3`;
}

// Call API endpoint
app.post('/api/call', async (req, res) => {
  const phoneNumber = req.body.phone || req.query.phone;
  if (!phoneNumber) return res.status(400).json({ success: false, message: "Missing 'phone'" });

  try {
    await generateTTS(reminderMessage);
    const call = await twilioClient.calls.create({
      to: phoneNumber,
      from: TWILIO_PHONE_NUMBER,
      url: `${PUBLIC_URL}/voice`,
      method: 'POST',
      machineDetection: 'DetectMessageEnd',
      statusCallback: `${PUBLIC_URL}/status`,
      statusCallbackMethod: 'POST',
      statusCallbackEvent: ['completed']
    });
    console.log(`📞 Initiating call to ${phoneNumber}. SID: ${call.sid}`);
    res.json({ success: true, callSid: call.sid });
  } catch (err) {
    console.error("❌ Error initiating call:", err.message);
    res.status(500).json({ success: false, message: "Call failed" });
  }
});

// /voice route — play audio and record
app.post('/voice', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.play(`${PUBLIC_URL}/audio/reminder.mp3`);
    twiml.record({
      maxLength: 10,
      playBeep: true,
      trim: 'silence',
      recordingStatusCallback: `${PUBLIC_URL}/record-complete`,
      recordingStatusCallbackMethod: 'POST'
    });
    res.type('text/xml').send(twiml.toString());
  });
  
  app.post('/status', async (req, res) => {
    console.log('✅ /status received:', req.body);
    res.sendStatus(200);
  });
  
// /record-complete — receive recording and transcribe
app.post('/record-complete', async (req, res) => {
  const { CallSid, RecordingUrl } = req.body;

  try {
    const audio = await axios.get(`${RecordingUrl}.mp3`, {
      auth: { username: TWILIO_ACCOUNT_SID, password: TWILIO_AUTH_TOKEN },
      responseType: 'arraybuffer'
    });

    const transcriptRes = await axios.post(
      'https://api.deepgram.com/v1/listen?punctuate=true',
      audio.data,
      { headers: { 'Content-Type': 'audio/mp3', 'Authorization': `Token ${DEEPGRAM_API_KEY}` } }
    );

    const transcript = transcriptRes.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    console.log(`📝 Call ${CallSid}, Response: "${transcript}"`);

    callLogs.push({ callSid: CallSid, status: 'answered', response: transcript });
    answeredCallSids.add(CallSid);
  } catch (err) {
    console.error("❌ Transcription failed:", err.message);
    callLogs.push({ callSid: CallSid, status: 'answered', response: '' });
  }

  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('Thank you. Goodbye.');
  twiml.hangup();
  res.type('text/xml').send(twiml.toString());
});

// /status — if call fails or is not answered
app.post('/status', async (req, res) => {
  const { CallSid, CallStatus, To, From } = req.body;

  if (['no-answer', 'busy', 'failed'].includes(CallStatus)) {
    try {
      await twilioClient.messages.create({
        to: To,
        from: From,
        body: smsMessage
      });
      console.log(`📲 SMS sent to ${To} after failed call.`);
      callLogs.push({ callSid: CallSid, status: 'SMS sent', response: '' });
    } catch (err) {
      console.error("❌ Failed to send SMS:", err.message);
    }
  }
  res.sendStatus(200);
});

// /incoming — when user calls Twilio number back
app.post('/incoming', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.play(`${PUBLIC_URL}/audio/reminder.mp3`);
  twiml.hangup();
  console.log(`📞 Incoming call from ${req.body.From}`);
  res.type('text/xml').send(twiml.toString());
});

// view logs
app.get('/api/logs', (req, res) => res.json(callLogs));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
