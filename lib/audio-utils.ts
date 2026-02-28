/**
 * Sumsori — Audio Utilities
 * PCM → WAV conversion for Gemini TTS output
 */

/**
 * Convert raw PCM data to WAV format.
 * Gemini TTS returns 24kHz 16-bit mono linear PCM.
 * This adds a proper WAV header so browsers can play it via <audio>.
 */
export function pcmToWav(
  pcmData: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16,
): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize;

  const wav = Buffer.alloc(fileSize);

  // RIFF header
  wav.write('RIFF', 0);
  wav.writeUInt32LE(fileSize - 8, 4); // File size - 8
  wav.write('WAVE', 8);

  // fmt subchunk
  wav.write('fmt ', 12);
  wav.writeUInt32LE(16, 16);           // Subchunk1 size (16 for PCM)
  wav.writeUInt16LE(1, 20);            // Audio format (1 = PCM)
  wav.writeUInt16LE(numChannels, 22);  // Number of channels
  wav.writeUInt32LE(sampleRate, 24);   // Sample rate
  wav.writeUInt32LE(byteRate, 28);     // Byte rate
  wav.writeUInt16LE(blockAlign, 32);   // Block align
  wav.writeUInt16LE(bitsPerSample, 34); // Bits per sample

  // data subchunk
  wav.write('data', 36);
  wav.writeUInt32LE(dataSize, 40);     // Data size
  pcmData.copy(wav, headerSize);       // PCM data

  return wav;
}
