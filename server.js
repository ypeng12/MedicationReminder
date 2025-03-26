// server.js

const express = require("express");
const twilio = require("twilio");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));

// Twilio voice reminder route
app.post("/voice", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  const gather = twiml.gather({
    input: "dtmf speech",
    timeout: 5,
    numDigits: 1,
    action: "/voice/response",
    method: "POST",
  });

  gather.say(
    "Hello! This is your medication reminder. Please press 1 if you have taken your medicine, or 2 if you have not."
  );

  res.type("text/xml");
  res.send(twiml.toString());
});

// Handle user input (DTMF or speech)
app.post("/voice/response", (req, res) => {
  const digit = req.body.Digits;
  const speech = req.body.SpeechResult;
  const twiml = new twilio.twiml.VoiceResponse();

  if (digit === "1") {
    twiml.say("Thank you for confirming. Take care!");
  } else if (digit === "2") {
    twiml.say("Okay, we will remind you again in 10 minutes.");
  } else if (speech) {
    twiml.say(`You said: ${speech}. We'll process your response.`);
  } else {
    twiml.say("We did not understand your response. Goodbye.");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
