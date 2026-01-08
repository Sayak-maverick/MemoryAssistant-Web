/**
 * audioService.ts - Audio recording and speech-to-text service
 *
 * This service handles:
 * 1. Recording audio using MediaRecorder API
 * 2. Converting audio to base64 data URL
 * 3. Transcribing audio using Google Speech-to-Text API
 *
 * How it works:
 * 1. Request microphone permission
 * 2. Record audio chunks
 * 3. Convert to data URL for storage
 * 4. Send to Speech-to-Text API for transcription
 */

import { VISION_API_KEY } from '../config/vision-config';

// Speech-to-Text API endpoint
const SPEECH_API_URL = 'https://speech.googleapis.com/v1/speech:recognize';

/**
 * Audio recorder class
 * Handles recording, stopping, and getting the audio data
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  /**
   * Start recording audio from microphone
   */
  async startRecording(): Promise<void> {
    try {
      // Request microphone permission
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder with WebM format
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm',
      });

      // Collect audio chunks as they're recorded
      this.audioChunks = [];
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording. Please allow microphone access.');
    }
  }

  /**
   * Stop recording and return audio as data URL
   */
  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // Combine all audio chunks into a single Blob
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

          // Convert Blob to data URL
          const dataUrl = await blobToDataURL(audioBlob);

          // Stop all media tracks (release microphone)
          this.stream?.getTracks().forEach((track) => track.stop());

          resolve(dataUrl);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /**
   * Cancel recording and clean up
   */
  cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.stream?.getTracks().forEach((track) => track.stop());
    this.audioChunks = [];
  }
}

/**
 * Convert Blob to base64 data URL
 */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Transcribe audio using Google Cloud Speech-to-Text API
 *
 * @param audioDataUrl - Base64 data URL of the audio
 * @returns Transcribed text
 */
export async function transcribeAudio(audioDataUrl: string): Promise<string> {
  try {
    // Extract base64 content from data URL
    // Data URL format: "data:audio/webm;base64,UklGRi..."
    const base64Audio = audioDataUrl.split(',')[1];

    if (!base64Audio) {
      throw new Error('Invalid audio data URL');
    }

    // Prepare the request for Speech-to-Text API
    // Multi-language support: API will automatically detect the language
    const requestBody = {
      config: {
        encoding: 'WEBM_OPUS',  // Audio encoding format
        sampleRateHertz: 48000,  // Sample rate
        languageCode: 'en-US',   // Primary language hint
        // Alternative languages for automatic detection
        alternativeLanguageCodes: [
          'es-ES',  // Spanish (Spain)
          'fr-FR',  // French (France)
          'de-DE',  // German (Germany)
          'it-IT',  // Italian (Italy)
          'pt-BR',  // Portuguese (Brazil)
          'zh-CN',  // Chinese (Simplified)
          'ja-JP',  // Japanese
          'ko-KR',  // Korean
          'ar-SA',  // Arabic (Saudi Arabia)
          'hi-IN',  // Hindi (India)
          'ru-RU',  // Russian
          'nl-NL',  // Dutch (Netherlands)
          'pl-PL',  // Polish
          'tr-TR',  // Turkish
          'vi-VN',  // Vietnamese
        ],
        enableAutomaticPunctuation: true,  // Add punctuation
      },
      audio: {
        content: base64Audio,  // Base64 encoded audio
      },
    };

    // Call the Speech-to-Text API
    const response = await fetch(`${SPEECH_API_URL}?key=${VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Speech-to-Text API error:', errorData);
      throw new Error(`Speech API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract transcription from response
    const transcription = data.results
      ?.map((result: any) => result.alternatives[0]?.transcript)
      .join(' ')
      .trim();

    return transcription || '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    // Return empty string on error
    return '';
  }
}
