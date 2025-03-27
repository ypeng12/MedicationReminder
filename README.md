# 🩺 Voice-Driven Medication Reminder System

This Node.js-based real-time medication reminder system automates voice communication to remind patients about their medication schedules. It integrates Twilio for telephony, ElevenLabs for text-to-speech (TTS), and Deepgram for speech-to-text (STT).

## 📋 Project Features

* **REST API to trigger voice calls** to patients by providing their phone number.
* **Real-time voice interaction:** Uses TTS to ask medication confirmation and STT to capture the patient’s response.
* **Unanswered Call Handling:** Automatically leaves a voicemail or sends an SMS reminder.
* **Patient-Initiated Calls:** Plays reminder messages if patients call back.
* **Detailed Logging:** Logs call SID, status, and transcribed patient response immediately after each call.

## ✅ Technical Stack

* **Backend:** Node.js with Express
* **Voice Communication:** Twilio API
* **Text-to-Speech:** ElevenLabs
* **Speech-to-Text:** Deepgram
* **Local Testing:** ngrok for webhook testing

## 📂 Project Structure

```
MedicationReminder/
├── audio/                    # TTS audio files
├── index.js                  # Application entry point
├── package.json
├── package-lock.json
├── .env.example              # Example environment configuration
├── README.md
```

## 🔑 Environment Configuration

Create a `<span>.env</span>` file with:

```
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1your_twilio_number

DEEPGRAM_API_KEY=your_deepgram_key
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=your_elevenlabs_voice_id

PUBLIC_URL=https://your-ngrok-url.ngrok-free.app
PORT=3000
```

## 🚀 Installation and Setup

### Step 1: Clone Repository

```
git clone https://github.com/your-github-username/MedicationReminder.git
cd MedicationReminder
```

### Step 2: Install Dependencies

```
npm install
```

### Step 3: Run ngrok (for webhook testing)

```
./ngrok http 3000
```

Update your `<span>.env</span>` file with your ngrok URL (`<span>PUBLIC_URL</span>`).

### Step 4: Start the Server

```
node index.js
```

You should see:

```
✅ Server running on port 3000
```

## 📞 Trigger a Voice Call

Send a POST request with the patient's phone number:

```
curl -X POST http://localhost:3000/api/call \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1PATIENT_PHONE_NUMBER"}'
```

## 📑 View Call Logs

To see call logs and transcriptions:

```
curl http://localhost:3000/api/logs
```

![image](https://github.com/user-attachments/assets/9a0a1395-034d-4e61-bb6a-4f50be3c0f04)


![image](https://github.com/user-attachments/assets/8564dcb2-ddec-4ef9-b858-f7e805c29f8d)

## 🌐 Webhook Endpoints

| Route                                  | Purpose                                   |
| -------------------------------------- | ----------------------------------------- |
| `<span>POST /voice</span>`           | Play reminder and record patient response |
| `<span>POST /record-complete</span>` | Transcribe patient's voice response       |
| `<span>POST /status</span>`          | Manage call status and fallback SMS       |
| `<span>POST /incoming</span>`        | Play message on patient callback          |

## 🧪 Bonus Implementations

## 📖 Documentation & Testing

* Clear setup and operation instructions provided.
* Modular and maintainable code structure.


## LLM Analysis Explanation



After the patient's speech is transcribed, the LLM (OpenAI's GPT) clearly classifies the patient's response into one of three categories:

- YES: Clearly confirms they took medications  
  Example: "Yes, I've taken all my medications today."

- NO: Clearly states they have NOT taken medications  
  Example: "No, I haven't taken them yet."

- UNCLEAR: Ambiguous or unrelated responses, difficult to interpret  
  Example: "I need a callback" or "I'm not sure."

## 🚧 Future Improvements (Optional)

* Integrate persistent storage for call logs (e.g., MongoDB, Redis).
* Comprehensive unit and integration testing.

## 🎯 Evaluation Criteria Met

* ✅ Modular code structure
* ✅ Fully functional call flow implementation
* ✅ Effective error handling and logging
* ✅ Detailed documentation (this README)

## ✉️ Submission

GitHub repository link: [MedicationReminder](https://github.com/your-github-username/MedicationReminder)

## 👤 Author

**Yuliang Peng**
