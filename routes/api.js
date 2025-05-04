const express = require('express');
const router = express.Router();
const multer = require('multer');
const transcriptionController = require('../controllers/transcriptionController');
const translationController = require('../controllers/translationController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max file size
});

// Transcribe audio file
router.post('/transcribe', upload.single('audio'), transcriptionController.transcribeAudio);

// Real-time transcription via WebSocket is handled in server.js

// Translate text
router.post('/translate', translationController.translateText);

// Get supported languages
router.get('/languages', (req, res) => {
  // This is a simplified list of languages Deepgram supports
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ko', name: 'Korean' },
    { code: 'hi', name: 'Hindi' },
    { code: 'nl', name: 'Dutch' },
    { code: 'ru', name: 'Russian' }
  ];
  
  res.json(languages);
});

module.exports = router;