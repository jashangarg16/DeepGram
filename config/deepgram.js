// Import the Deepgram SDK
const { createClient } = require('@deepgram/sdk');

// Create a Deepgram client using the v3 format
const deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);

// Deepgram options for pre-recorded audio
const prerecordedOptions = {
  smart_format: true,
  model: 'general',
  language: 'en',  // Default language, can be overridden per request
  detect_language: true,
  diarize: true,   // Speaker identification
};

// Deepgram options for live/streaming audio
const liveOptions = {
  smart_format: true,
  model: 'general',
  language: 'en',
  diarize: true,
  interim_results: true,

};

module.exports = {
  deepgramClient,
  prerecordedOptions,
  liveOptions
};