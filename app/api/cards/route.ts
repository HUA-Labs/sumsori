import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ cards: [] }, { status: 401 });
    }

    const { data: cards, error } = await supabase
      .from('cards')
      .select('id, image_url, core_emotion, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Query failed: ${error.message}`);
    }

    return NextResponse.json({ cards: cards ?? [] });
  } catch (error) {
    console.error('[/api/cards] Error:', error);
    return NextResponse.json({ cards: [] }, { status: 500 });
  }
}
