const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeResponse(text) {
  const prompt = `
  Determine if the patient confirmed they've taken their medications based on this transcript:
  
  "${text}"

  Respond only with one word: YES, NO, or UNCLEAR.
  `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content.trim();
}

module.exports = { analyzeResponse };
