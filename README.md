# Healthcare Multilingual Assistant

A real-time speech-to-text and translation application designed specifically for healthcare settings to facilitate communication between healthcare providers and patients who speak different languages.

## Overview

The Healthcare Multilingual Assistant is a web application that allows for:

- Real-time speech transcription in multiple languages
- Translation of patient speech for healthcare providers
- Translation of provider responses back to the patient's language
- Full conversation history tracking
- Support for both real-time audio recording and audio file uploads

## Features

- **Real-time Speech Recognition**: Using Deepgram's API to provide accurate, real-time transcription
- **Multiple Language Support**: Transcription and translation support for 12+ languages
- **Bidirectional Translation**: Translate from patient's language to provider's language and vice versa
- **Conversation History**: Complete record of all interactions, including original and translated text
- **Responsive UI**: Clean interface that works on various devices
- **Audio File Upload**: Support for transcribing pre-recorded audio files

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.io
- **Speech-to-Text**: Deepgram API (v3)
- **Translation**: (Currently using a mock translation service, configurable for Google Cloud Translation API)
- **File Handling**: Multer for audio file uploads

## Prerequisite

- Node.js (v14+)
- npm (v6+)
- Deepgram API key
- (Optional) Google Cloud Translation API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/healthcare-translator.git
cd healthcare-translator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
DEEPGRAM_API_KEY=your_deepgram_api_key
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
```

4. Start the server:
```bash
node server.js
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Select Languages**:
   - Choose the patient's language from the "Source Language" dropdown
   - Choose the healthcare provider's language from the "Target Language" dropdown

2. **Record or Upload Audio**:
   - Click "Start Recording" to begin capturing the patient's speech
   - Click "Stop Recording" when finished
   - Alternatively, upload an audio file using the file input

3. **View Transcription and Translation**:
   - The original transcribed text appears in the "Original Speech" section
   - The translated text appears in the "Translated Text" section

4. **Respond to Patient**:
   - The healthcare provider types their response in the "Provider Response" text area
   - Click "Translate Response" to translate it to the patient's language
   - The translated response appears in the "Translated Response" section

5. **Review Conversation History**:
   - The full conversation, including original and translated messages, is shown in the "Conversation History" section

## Directory Structure

```
healthcare-translator/
│
├── config/
│   └── deepgram.js         # Deepgram API configuration
│
├── controllers/
│   ├── transcriptionController.js  # Handles audio transcription
│   └── translationController.js    # Handles text translation
│
├── public/
│   ├── css/
│   │   └── style.css       # Application styles
│   ├── js/
│   │   ├── app.js          # Main application logic
│   │   └── recorder.js     # Audio recording functionality
│   └── index.html          # Main HTML file
│
├── routes/
│   └── api.js              # API routes
│
├── views/
│   └── index.ejs           # EJS template (alternative to index.html)
│
├── .env                    # Environment variables (not in repo)
├── package.json            # Project dependencies
├── server.js               # Express server setup
└── README.md               # Project documentation
```

## API Endpoints

- **POST `/api/transcribe`**: Transcribe uploaded audio file
- **POST `/api/translate`**: Translate text between languages
- **GET `/api/languages`**: Get list of supported languages

## WebSocket Events

- **`audioData`**: Send audio chunks from client to server for real-time transcription
- **`transcription`**: Send transcription results from server to client
- **`startTranscription`**: Initialize real-time transcription with selected language
- **`endTranscription`**: End real-time transcription session

## Current Limitations

- Translation functionality is currently mocked. To enable real translation, uncomment the Google Cloud Translation API code in `translationController.js` and provide a valid API key
- Audio quality may affect transcription accuracy
- Limited to languages supported by Deepgram and translation service

## Future Enhancements

- Add text-to-speech functionality to read translations aloud
- Implement more robust error handling and retry mechanisms
- Add user authentication for healthcare providers
- Support for medical terminology and specialized vocabulary
- Session recording and playback
- Extended language support

## License

[ISC License](LICENSE)

## Acknowledgments

- [Deepgram](https://deepgram.com/) for speech-to-text API
- [Socket.io](https://socket.io/) for real-time communication
- [Bootstrap](https://getbootstrap.com/) for responsive UI components
