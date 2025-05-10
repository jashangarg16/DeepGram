const { deepgramClient, prerecordedOptions, liveOptions } = require('../config/deepgram');
const { Buffer } = require('buffer');

exports.transcribeAudio = async (req, res) => {
  try {
    // Get source language from request
    const sourceLanguage = req.body.sourceLanguage || 'en';
    
    // Update options with the specified language
    const transcriptionOptions = {
      ...prerecordedOptions,
      language: sourceLanguage
    };

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Send to Deepgram for transcription using the v3 API format
    const { result, error } = await deepgramClient.listen.prerecorded.transcribeFile(
      req.file.buffer,
      {
        mimetype: req.file.mimetype,
        ...transcriptionOptions
      }
    );
    
    if (error) {
      throw new Error(`Deepgram API error: ${error.message}`);
    }
    
    // Extract transcript
    const transcript = result.results.channels[0].alternatives[0].transcript;
    
    // Send the transcript to the client
    res.json({ 
      success: true, 
      transcript,
      language: sourceLanguage
    });
    
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Transcription failed', 
      details: error.message 
    });
  }
};

// For WebSocket real-time transcriptions
exports.setupLiveTranscription = (socket, language) => {
  try {
    // Update live options with the specified language
    const options = {
      ...liveOptions,
      language: language || 'en'
    };

    // Create a live transcription connection
    const liveTc = deepgramClient.listen.live(options);

    // Forward audio data from client to Deepgram
    socket.on('audioData', (data) => {
      if (liveTc.getReadyState() === 1) {
        liveTc.send(data);
      }
    });

    // Forward transcription results from Deepgram to client
    liveTc.on('transcriptReceived', (transcription) => {
      socket.emit('transcription', transcription);
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
      liveTc.finish();
    });

    socket.on('endTranscription', () => {
      liveTc.finish();
    });

    // Handle errors
    liveTc.on('error', (error) => {
      console.error('Deepgram error:', error);
      socket.emit('error', 'Transcription error');
    });

    liveTc.on('close', () => {
      socket.emit('transcriptionClosed');
    });

  } catch (error) {
    console.error('Setup live transcription error:', error);
    socket.emit('error', 'Failed to setup live transcription');
  }
};