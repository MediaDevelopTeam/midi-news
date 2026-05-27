import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const subscription = await request.json();

  // 브라우저 구독 정보에서 핵심 키값들을 추출합니다.
  const { endpoint, keys } = subscription;
  const { auth, p256dh } = keys;

  // DB에 중복 저장되지 않도록 먼저 확인 후 삽입(Upsert)합니다.
  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      { endpoint, auth, p256dh },
      { onConflict: 'endpoint' }
    );

  if (error) {
    console.error('DB 저장 에러:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}