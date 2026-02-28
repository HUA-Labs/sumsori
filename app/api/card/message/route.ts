import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { CardMessageResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { cardId, message } = await req.json();

    if (!cardId || typeof message !== 'string') {
      return NextResponse.json<CardMessageResponse>(
        { success: false },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('cards')
      .update({ personal_message: message })
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
