const axios = require('axios');
const fs = require('fs');

exports.synthesizeSpeech = async () => {
  const texts = {
    message:
      "Hello, this is a reminder from your healthcare provider to confirm your medications for the day. Please confirm if you have taken your Aspirin, Cardivol, and Metformin today.",
    voicemail:
      "We called to check on your medication but couldn't reach you. Please call us back or take your medications if you haven't done so.",
  };

  for (let [key, text] of Object.entries(texts)) {
    const res = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      { text },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        responseType: 'arraybuffer',
      }
    );
    fs.writeFileSync(`public/audio/${key}.mp3`, res.data);
  }
};
