import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { CardMessageResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { cardId, message, showTranscript } = await req.json();

    if (!cardId) {
      return NextResponse.json<CardMessageResponse>(
        { success: false },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {};
    if (typeof message === 'string') updates.personal_message = message;
    if (typeof showTranscript === 'boolean') updates.show_transcript = showTranscript;

    const { error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', cardId);

    if (error) {
      throw new Error(`Update failed: ${error.message}`);
    }

    return NextResponse.json<CardMessageResponse>({ success: true });
  } catch (error) {
    console.error('[/api/card/message] Error:', error);
    return NextResponse.json<CardMessageResponse>(
      { success: false },
      { status: 500 },
    );
  }
}
