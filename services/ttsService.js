const axios = require('axios');
const fs = require('fs');

exports.synthesizeSpeech = async () => {
  const texts = {
    message: "Hello, confirm if you've taken Aspirin, Cardivol, and Metformin today.",
    voicemail: "We couldn't reach you. Please call back or take your medication.",
  };

  for (let [key, text] of Object.entries(texts)) {
    const res = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      { text },
      { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }, responseType: 'arraybuffer' }
    );
    fs.writeFileSync(`public/audio/${key}.mp3`, res.data);
  }
};
