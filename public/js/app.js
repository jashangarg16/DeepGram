document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startRecordBtn = document.getElementById('startRecord');
    const stopRecordBtn = document.getElementById('stopRecord');
    const audioFileInput = document.getElementById('audioFile');
    const sourceLanguageSelect = document.getElementById('sourceLanguage');
    const targetLanguageSelect = document.getElementById('targetLanguage');
    const originalTextDiv = document.getElementById('originalText');
    const translatedTextDiv = document.getElementById('translatedText');
    const responseTextArea = document.getElementById('responseText');
    const translateResponseBtn = document.getElementById('translateResponse');
    const translatedResponseDiv = document.getElementById('translatedResponse');
    const conversationHistoryDiv = document.getElementById('conversationHistory');
    
    // Initialize socket connection
    const socket = io();
    
    // Audio recording variables
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;
    
    // Load supported languages
    fetchLanguages();
    
    // Event Listeners
    startRecordBtn.addEventListener('click', startRecording);
    stopRecordBtn.addEventListener('click', stopRecording);
    audioFileInput.addEventListener('change', handleAudioFile);
    translateResponseBtn.addEventListener('click', translateProviderResponse);
    
    // Socket events
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    socket.on('transcription', (data) => {
      // Handle real-time transcription updates
      if (data.is_final) {
        originalTextDiv.textContent = data.channel.alternatives[0].transcript;
        translateText(data.channel.alternatives[0].transcript);
      }
    });
    
    // Functions
    async function fetchLanguages() {
      try {
        const response = await fetch('/api/languages');
        const languages = await response.json();
        
        // Populate language dropdowns
        languages.forEach(lang => {
          const sourceOption = document.createElement('option');
          sourceOption.value = lang.code;
          sourceOption.textContent = lang.name;
          sourceLanguageSelect.appendChild(sourceOption);
          
          const targetOption = document.createElement('option');
          targetOption.value = lang.code;
          targetOption.textContent = lang.name;
          targetLanguageSelect.appendChild(targetOption);
        });
        
        // Set English as default for healthcare provider
        targetLanguageSelect.value = 'en';
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    }
    
    async function startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
            
            // For real-time transcription
            const reader = new FileReader();
            reader.onloadend = () => {
              const arrayBuffer = reader.result;
              socket.emit('audioData', arrayBuffer);
            };
            reader.readAsArrayBuffer(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          await uploadAudio(audioBlob);
          
          // Reset
          audioChunks = [];
          socket.emit('endTranscription');
        };
        
        // Start recording
        mediaRecorder.start(100); // Collect 100ms chunks for real-time processing
        isRecording = true;
        
        // Update UI
        startRecordBtn.disabled = true;
        stopRecordBtn.disabled = false;
        
        // Setup live transcription
        socket.emit('startTranscription', { language: sourceLanguageSelect.value });
        
      } catch (error) {
        console.error('Error starting recording:', error);
        alert('Cannot access microphone. Please check permissions.');
      }
    }
    
    function stopRecording() {
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        // Update UI
        startRecordBtn.disabled = false;
        stopRecordBtn.disabled = true;
      }
    }
    
    async function handleAudioFile(event) {
      const file = event.target.files[0];
      if (file) {
        await uploadAudio(file);
      }
    }
    
    async function uploadAudio(audioBlob) {
      try {
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('sourceLanguage', sourceLanguageSelect.value);
        
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
          originalTextDiv.textContent = result.transcript;
          translateText(result.transcript);
          
          // Add to conversation history
          addToConversationHistory('patient', result.transcript);
        } else {
          console.error('Transcription failed:', result.error);
          alert('Transcription failed: ' + result.error);
        }
      } catch (error) {
        console.error('Error uploading audio:', error);
        alert('Error uploading audio: ' + error.message);
      }
    }
    
    async function translateText(text) {
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            sourceLanguage: sourceLanguageSelect.value,
            targetLanguage: targetLanguageSelect.value
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          translatedTextDiv.textContent = result.translatedText;
        } else {
          console.error('Translation failed:', result.error);
          alert('Translation failed: ' + result.error);
        }
      } catch (error) {
        console.error('Error translating text:', error);
        alert('Error translating text: ' + error.message);
      }
    }
    
    async function translateProviderResponse() {
      const responseText = responseTextArea.value.trim();
      
      if (!responseText) {
        alert('Please enter a response before translating.');
        return;
      }
      
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: responseText,
            sourceLanguage: targetLanguageSelect.value,
            targetLanguage: sourceLanguageSelect.value
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          translatedResponseDiv.textContent = result.translatedText;
          
          // Add to conversation history
          addToConversationHistory('provider', responseText);
          addToConversationHistory('provider-translated', result.translatedText);
          
          // Clear response textarea
          responseTextArea.value = '';
        } else {
          console.error('Translation failed:', result.error);
          alert('Translation failed: ' + result.error);
        }
      } catch (error) {
        console.error('Error translating response:', error);
        alert('Error translating response: ' + error.message);
      }
    }
    
    function addToConversationHistory(speaker, text) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${speaker}`;
      
      const timestamp = new Date().toLocaleTimeString();
      
      let speakerLabel = 'Patient';
      if (speaker === 'provider') speakerLabel = 'Provider';
      if (speaker === 'provider-translated') speakerLabel = 'Provider (Translated)';
      
      messageDiv.innerHTML = `
        <div class="message-header">
          <strong>${speakerLabel}</strong>
          <span class="timestamp">${timestamp}</span>
        </div>
        <div class="message-body">${text}</div>
      `;
      
      conversationHistoryDiv.appendChild(messageDiv);
      
      // Scroll to bottom
      conversationHistoryDiv.scrollTop = conversationHistoryDiv.scrollHeight;
    }
  });