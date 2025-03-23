const axios = require('axios');

exports.transcribeRecording = async (recordingUrl) => {
  const audio = (await axios.get(`${recordingUrl}.wav`, {
    auth: {
      username: process.env.TWILIO_ACCOUNT_SID,
      password: process.env.TWILIO_AUTH_TOKEN,
    },
    responseType: 'arraybuffer',
  })).data;

  const res = await axios.post('https://api.deepgram.com/v1/listen?punctuate=true', audio, {
    headers: {
      'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
      'Content-Type': 'audio/wav'
    }
  });

  return res.data.results.channels[0].alternatives[0].transcript || '';
};
