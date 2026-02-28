import { NextRequest, NextResponse } from 'next/server';
import { getGenAI, ANALYSIS_MODEL, IMAGE_MODEL, TTS_MODEL } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { TEXT_ANALYSIS_PROMPT } from '@/lib/prompts/text-analysis';
import { TEXT_ANALYSIS_PROMPT_EN } from '@/lib/prompts/text-analysis-en';
import { pcmToWav } from '@/lib/audio-utils';
import type { TextEmotionAnalysis, TextAnalyzeResponse } from '@/lib/types';
import { getRandomTextDemo } from '@/lib/demo/text-samples';
import { auth } from '@/lib/auth';

export const maxDuration = 60; // Vercel function timeout

/** Voice name mapping */
const VOICE_MAP: Record<string, string> = {
  'female-warm': 'Sulafat',
  'female-firm': 'Kore',
  'male-upbeat': 'Puck',
  'male-calm': 'Enceladus',
};

export async function POST(req: NextRequest) {
  let locale = 'ko';
  try {
    // 1. Receive text input
    const formData = await req.formData();
    const text = formData.get('text')?.toString() || '';
    const isDemo = formData.get('demo') === 'true';
    locale = formData.get('locale')?.toString() || 'ko';
    const voiceKey = formData.get('voice')?.toString() || 'female-warm';
    const selectedVoice = VOICE_MAP[voiceKey] || 'Sulafat';

    // Demo mode — return cached result
    if (isDemo || !text.trim()) {
      const demo = getRandomTextDemo(locale);
      return NextResponse.json<TextAnalyzeResponse>({
        success: true,
        data: {
          cardId: 'demo',
          surfaceEmotion: demo.analysis.surfaceEmotion,
          hiddenEmotion: demo.analysis.hiddenEmotion,
          concordance: demo.analysis.concordance,
          coreEmotion: demo.analysis.coreEmotion,
          summary: demo.analysis.summary,
          image: { url: demo.imageUrl },
          audio: { url: demo.audioUrl },
        },
      });
    }

    // 2. Gemini text emotion analysis
    const prompt = locale === 'en' ? TEXT_ANALYSIS_PROMPT_EN : TEXT_ANALYSIS_PROMPT;
    const analysisResponse = await getGenAI().models.generateContent({
      model: ANALYSIS_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { text: `\n\n분석할 텍스트:\n"${text}"` },
          ],
        },
      ],
    });

    // Parse analysis JSON
    let rawText = analysisResponse.text?.trim() ?? '';
    if (rawText.startsWith('```')) {
      rawText = rawText.split('\n').slice(1).join('\n');
      if (rawText.endsWith('```')) {
        rawText = rawText.slice(0, -3).trim();
      }
    }

    const analysis: TextEmotionAnalysis = JSON.parse(rawText);

    // 3. Generate TTS from original text with emotion direction
    const ttsPrompt = locale === 'ko'
      ? `${analysis.ttsDirection.emotion}한 톤으로, ${analysis.ttsDirection.pace} 속도로, ${analysis.ttsDirection.voiceCharacter} 느낌으로 말해줘: "${text}"`
      : `Speak with a ${analysis.ttsDirection.emotion} tone, at a ${analysis.ttsDirection.pace} pace, with a ${analysis.ttsDirection.voiceCharacter} voice: "${text}"`;

    const ttsResponse = await getGenAI().models.generateContent({
      model: TTS_MODEL,
      contents: ttsPrompt,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    // Extract PCM audio data
    let audioData: Buffer | null = null;
    if (ttsResponse.candidates?.[0]?.content?.parts) {
      for (const part of ttsResponse.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const pcmBuffer = Buffer.from(part.inlineData.data, 'base64');
          audioData = pcmToWav(pcmBuffer);
          break;
        }
      }
    }

    if (!audioData) {
      throw new Error('TTS generation returned no audio data');
    }

    // 4. Upload TTS audio to Supabase Storage
    const cardId = crypto.randomUUID();
    const audioPath = `${cardId}.wav`;

    const { error: audioUploadError } = await supabase.storage
      .from('card-audio')
      .upload(audioPath, audioData, {
        contentType: 'audio/wav',
        upsert: false,
      });

    if (audioUploadError) {
      throw new Error(`Audio upload failed: ${audioUploadError.message}`);
    }

    const { data: audioUrlData } = supabase.storage
      .from('card-audio')
      .getPublicUrl(audioPath);

    const audioUrl = audioUrlData.publicUrl;

    // 5. Generate image from imagePrompt
    const imagePromptStr = Object.entries(analysis.imagePrompt)
      .map(([k, v]) => `${k}: ${v}`)
      .join('. ');

    const imageResponse = await getGenAI().models.generateContent({
      model: IMAGE_MODEL,
      contents: imagePromptStr,
      config: {
        responseModalities: ['image', 'text'],
      },
    });

    // Extract image data
    let imageData: Buffer | null = null;
    if (imageResponse.candidates?.[0]?.content?.parts) {
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          imageData = Buffer.from(part.inlineData.data, 'base64');
          break;
        }
      }
    }

    if (!imageData) {
      throw new Error('Image generation returned no image data');
    }

    // 6. Upload image to Supabase Storage
    const imagePath = `${cardId}.png`;

    const { error: imageUploadError } = await supabase.storage
      .from('card-images')
      .upload(imagePath, imageData, {
        contentType: 'image/png',
        upsert: false,
      });

    if (imageUploadError) {
      throw new Error(`Image upload failed: ${imageUploadError.message}`);
    }

    const { data: imageUrlData } = supabase.storage
      .from('card-images')
      .getPublicUrl(imagePath);

    const imageUrl = imageUrlData.publicUrl;

    // 7. Save card to Supabase DB
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const nickname = session?.user?.name ?? null;

    const { error: insertError } = await supabase.from('cards').insert({
      id: cardId,
      user_id: userId,
      nickname,
      input_mode: 'text',
      voice_tone: null,
      text_content: {
        emotion: analysis.surfaceEmotion.emotion,
        themes: analysis.surfaceEmotion.themes,
        keywords: analysis.surfaceEmotion.keywords,
        sentiment: analysis.surfaceEmotion.sentiment,
        transcript: text,
      },
      concordance: analysis.concordance,
      core_emotion: analysis.coreEmotion,
      summary: analysis.summary,
      image_url: imageUrl,
      audio_url: audioUrl,
      image_prompt: analysis.imagePrompt,
      surface_emotion: analysis.surfaceEmotion,
      hidden_emotion: analysis.hiddenEmotion,
    });

    if (insertError) {
      throw new Error(`Card save failed: ${insertError.message}`);
    }

    // 8. Return result
    return NextResponse.json<TextAnalyzeResponse>({
      success: true,
      data: {
        cardId,
        surfaceEmotion: analysis.surfaceEmotion,
        hiddenEmotion: analysis.hiddenEmotion,
        concordance: analysis.concordance,
        coreEmotion: analysis.coreEmotion,
        summary: analysis.summary,
        image: { url: imageUrl },
        audio: { url: audioUrl },
      },
    });
  } catch (error) {
    console.error('[/api/text-analyze] Error:', error);

    // Fallback to demo on any error
    const demo = getRandomTextDemo(locale);
    return NextResponse.json<TextAnalyzeResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: {
          cardId: 'demo',
          surfaceEmotion: demo.analysis.surfaceEmotion,
          hiddenEmotion: demo.analysis.hiddenEmotion,
          concordance: demo.analysis.concordance,
          coreEmotion: demo.analysis.coreEmotion,
          summary: demo.analysis.summary,
          image: { url: demo.imageUrl },
          audio: { url: demo.audioUrl },
        },
      },
      { status: 500 },
    );
  }
}
