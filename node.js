const accountSid = "AC11e7b4ad871f1cb18c42dda9c3ca4669";
const authToken = "f1421f143b03442f52dec6026f241fd6";
const client = require("twilio")(accountSid, authToken);

client.calls.create({
  url: "https://bff3-2603-8000-75f0-8d30-b5f9-97ee-1aa4-c0.ngrok-free.app/voice",  // ✅ Your voice logic
  to: "+12408869716",
  from: "+18669308686",
})
.then(call => console.log("Call SID:", call.sid))
.catch(err => console.error("❌ Error:", err));
