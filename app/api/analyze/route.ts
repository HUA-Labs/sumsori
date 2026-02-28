import { NextRequest, NextResponse } from 'next/server';
import { getGenAI, ANALYSIS_MODEL, IMAGE_MODEL } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { ANALYSIS_PROMPT } from '@/lib/prompts/analysis';
import type { EmotionAnalysis, AnalyzeResponse } from '@/lib/types';
import { getRandomDemo } from '@/lib/demo/samples';
import { auth } from '@/lib/auth';

export const maxDuration = 60; // Vercel function timeout

export async function POST(req: NextRequest) {
  try {
    // 1. Receive audio blob
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const isDemo = formData.get('demo') === 'true';

    // Demo mode — return cached result
    if (isDemo || !audioFile) {
      const demo = getRandomDemo();
      return NextResponse.json<AnalyzeResponse>({
        success: true,
        data: {
          cardId: 'demo',
          voiceTone: demo.analysis.voiceTone,
          textContent: demo.analysis.textContent,
          concordance: demo.analysis.concordance,
          coreEmotion: demo.analysis.coreEmotion,
          summary: demo.analysis.summary,
          image: { url: demo.imageUrl },
        },
      });
    }

    // 2. Convert audio to base64
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    // Determine MIME type from file
    const mimeType = audioFile.type || 'audio/webm';

    // 3. Gemini analysis — single call for everything
    const analysisResponse = await getGenAI().models.generateContent({
      model: ANALYSIS_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: ANALYSIS_PROMPT },
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
          ],
        },
      ],
    });

    // Parse analysis JSON
    let rawText = analysisResponse.text?.trim() ?? '';
    // Strip markdown code fences if present
    if (rawText.startsWith('```')) {
      rawText = rawText.split('\n').slice(1).join('\n');
      if (rawText.endsWith('```')) {
        rawText = rawText.slice(0, -3).trim();
      }
    }

    const analysis: EmotionAnalysis = JSON.parse(rawText);

    // 4. Generate image from imagePrompt
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

    // Extract image data from response
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

    // 5. Upload image to Supabase Storage
    const cardId = crypto.randomUUID();
    const imagePath = `${cardId}.png`;

    const { error: uploadError } = await supabase.storage
      .from('card-images')
      .upload(imagePath, imageData, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('card-images')
      .getPublicUrl(imagePath);

    const imageUrl = publicUrlData.publicUrl;

    // 6. Save card to Supabase DB
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const nickname = session?.user?.name ?? null;

    const { error: insertError } = await supabase.from('cards').insert({
      id: cardId,
      user_id: userId,
      nickname,
      voice_tone: analysis.voiceTone,
      text_content: analysis.textContent,
      concordance: analysis.concordance,
      core_emotion: analysis.coreEmotion,
      summary: analysis.summary,
      image_url: imageUrl,
      image_prompt: analysis.imagePrompt,
    });

    if (insertError) {
      throw new Error(`Card save failed: ${insertError.message}`);
    }

    // 7. Return result
    return NextResponse.json<AnalyzeResponse>({
      success: true,
      data: {
        cardId,
        voiceTone: analysis.voiceTone,
        textContent: analysis.textContent,
        concordance: analysis.concordance,
        coreEmotion: analysis.coreEmotion,
        summary: analysis.summary,
        image: { url: imageUrl },
      },
    });
  } catch (error) {
    console.error('[/api/analyze] Error:', error);

    // Fallback to demo on any error
    const demo = getRandomDemo();
    return NextResponse.json<AnalyzeResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: {
          cardId: 'demo',
          voiceTone: demo.analysis.voiceTone,
          textContent: demo.analysis.textContent,
          concordance: demo.analysis.concordance,
          coreEmotion: demo.analysis.coreEmotion,
          summary: demo.analysis.summary,
          image: { url: demo.imageUrl },
        },
      },
      { status: 500 },
    );
  }
}
