const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.startCall = async (toNumber) => {
  const call = await client.calls.create({
    url: `${process.env.BASE_URL}/voice`,
    to: toNumber,
    from: process.env.TWILIO_PHONE_NUMBER,
    machineDetection: 'DetectMessageEnd',
    statusCallback: `${process.env.BASE_URL}/status`,
    statusCallbackEvent: ['completed'],
  });
  return call.sid;
};

exports.sendSMS = async (toNumber) => {
  await client.messages.create({
    to: toNumber,
    from: process.env.TWILIO_PHONE_NUMBER,
    body: "We couldn't reach you about your medication. Please call us or take them.",
  });
};
