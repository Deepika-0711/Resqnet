/**
 * ARCHITECTURAL BOUNDARY:
 * ElevenLabs Speech-to-Text Voice Integration Service.
 *
 * Provides voice-first citizen incident reporting by converting citizen voice recordings
 * into natural language transcripts using the ElevenLabs Speech-to-Text API.
 *
 * Security & Reliability Constraints:
 * - API key is stored strictly on backend (process.env.ELEVENLABS_API_KEY) and NEVER exposed to frontend.
 * - Enforces 10MB audio file size limit.
 * - Rejects unsupported audio mime types.
 * - Provides graceful error handling if ElevenLabs is unconfigured or unreachable.
 */

const axios = require('axios');
const FormData = require('form-data');

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const SUPPORTED_MIME_TYPES = [
  'audio/webm',
  'audio/wav',
  'audio/x-wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
  'audio/m4a',
  'audio/mp4',
  'audio/aac'
];

/**
 * Transcribes citizen voice recording to text.
 * @param {object} params
 * @param {string} params.audioBase64 - Base64 encoded audio string
 * @param {string} params.mimeType - Audio MIME type (e.g. 'audio/webm')
 * @returns {Promise<{transcript: string, language: string, confidence: number}>}
 */
async function transcribeAudio({ audioBase64, mimeType = 'audio/webm' }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!audioBase64) {
    const error = new Error('Audio payload is missing');
    error.statusCode = 400;
    throw error;
  }

  // Sanitize base64 data URL if present (e.g., "data:audio/webm;base64,...")
  let cleanBase64 = audioBase64;
  if (audioBase64.includes(';base64,')) {
    const parts = audioBase64.split(';base64,');
    cleanBase64 = parts[1];
    if (parts[0].startsWith('data:')) {
      mimeType = parts[0].replace('data:', '');
    }
  }

  // Validate MIME type
  const normalizedMime = mimeType.toLowerCase().split(';')[0].trim();
  if (!SUPPORTED_MIME_TYPES.includes(normalizedMime)) {
    const error = new Error(`Unsupported audio format: ${normalizedMime}. Supported formats: webm, wav, mp3, ogg, m4a.`);
    error.statusCode = 400;
    throw error;
  }

  // Convert Base64 to Buffer & Check Size
  const audioBuffer = Buffer.from(cleanBase64, 'base64');
  if (audioBuffer.length > MAX_FILE_SIZE_BYTES) {
    const error = new Error(`Audio file size (${(audioBuffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds 10 MB limit.`);
    error.statusCode = 400;
    throw error;
  }

  // Verify API key configuration
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_elevenlabs_api_key_here') {
    const error = new Error('ElevenLabs API key is not configured on the backend server. Voice transcription is unavailable.');
    error.statusCode = 503;
    throw error;
  }

  try {
    // Construct Multipart Form Data for ElevenLabs Speech-to-Text API
    const form = new FormData();
    const ext = normalizedMime.includes('webm') ? 'webm' : (normalizedMime.includes('wav') ? 'wav' : 'mp3');
    form.append('file', audioBuffer, {
      filename: `citizen_report.${ext}`,
      contentType: normalizedMime
    });
    form.append('model_id', 'scribe_v1');

    const response = await axios.post('https://api.elevenlabs.io/v1/speech-to-text', form, {
      headers: {
        ...form.getHeaders(),
        'xi-api-key': apiKey
      },
      timeout: 15000
    });

    if (response.data && response.data.text) {
      return {
        transcript: response.data.text.trim(),
        language: response.data.language_code || 'en',
        confidence: response.data.confidence || 0.95
      };
    }

    throw new Error('ElevenLabs API returned empty transcription result.');
  } catch (err) {
    if (err.statusCode) throw err;

    console.error('[ElevenLabs Service Error]', err.response?.data || err.message);
    const apiErrorMsg = err.response?.data?.detail?.message || err.response?.data?.message || err.message;
    const error = new Error(`ElevenLabs Voice Transcription Failed: ${apiErrorMsg}`);
    error.statusCode = err.response?.status || 502;
    throw error;
  }
}

module.exports = {
  transcribeAudio,
  SUPPORTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES
};
