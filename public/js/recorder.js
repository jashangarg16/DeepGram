// This file handles the audio recording functionality

class AudioRecorder {
    constructor(options = {}) {
      this.options = {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 128000,
        ...options
      };
      
      this.mediaRecorder = null;
      this.stream = null;
      this.chunks = [];
      this.isRecording = false;
      
      this.onDataAvailable = this.options.onDataAvailable || (() => {});
      this.onStop = this.options.onStop || (() => {});
      this.onError = this.options.onError || (() => {});
    }
    
    async start() {
      try {
        this.chunks = [];
        
        // Get audio stream
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: false
        });
        
        // Create media recorder
        this.mediaRecorder = new MediaRecorder(this.stream, this.options);
        
        // Set up event handlers
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            this.chunks.push(e.data);
            this.onDataAvailable(e.data);
          }
        };
        
        this.mediaRecorder.onstop = () => {
          // Create the final blob from all chunks
          const blob = new Blob(this.chunks, { type: this.options.mimeType });
          this.onStop(blob);
          
          // Stop all tracks
          this.stream.getTracks().forEach(track => track.stop());
          
          // Reset state
          this.isRecording = false;
          this.stream = null;
        };
        
        // Start recording
        this.mediaRecorder.start(100); // Collect in 100ms chunks
        this.isRecording = true;
        
        return true;
      } catch (error) {
        this.onError(error);
        console.error('Error starting recorder:', error);
        return false;
      }
    }
    
    stop() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        return true;
      }
      return false;
    }
    
    pause() {
      if (this.mediaRecorder && this.isRecording && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.pause();
        return true;
      }
      return false;
    }
    
    resume() {
      if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
        this.mediaRecorder.resume();
        return true;
      }
      return false;
    }
    
    isSupported() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }
  }
  
  // Expose to global scope
  window.AudioRecorder = AudioRecorder;