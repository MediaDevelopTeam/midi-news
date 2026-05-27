import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    // 1. Supabase DB에서 모든 구독자 정보 가져오기
    const { data: dbSubs, error } = await supabase.from('subscriptions').select('*');
    
    if (error || !dbSubs) {
      throw new Error(error?.message || '구독자 목록을 가져올 수 없습니다.');
    }

    console.log(`[크론] DB에서 조회된 구독자 수: ${dbSubs.length}명`);

    // 2. web-push 라이브러리가 읽을 수 있는 형태로 규격 포맷팅
    const formattedSubs = dbSubs.map(sub => ({
      endpoint: sub.endpoint,
      keys: {
        auth: sub.auth,
        p256dh: sub.p256dh
      }
    }));

    // 3. 푸시 알림 내용 생성
    const payload = JSON.stringify({
      title: '🎂 드디어 성공한 푸시 알림! 🎉',
      body: '서버가 꺼졌다가 깨어나도 DB 덕분에 주소를 기억하고 알림을 보냈습니다! 🚀',
    });

    // 4. 전체 발송
    const pushPromises = formattedSubs.map((sub) =>
      webpush.sendNotification(sub, payload).catch((err) => console.error('발송 에러:', err))
    );

    await Promise.all(pushPromises);

    return NextResponse.json({ 
      message: 'DB 기반 알림 발송 완료', 
      sentCount: formattedSubs.length 
    });

  } catch (err) {
    console.error('크론 작업 중 치명적 에러:', err);
    return NextResponse.json({ error: '알림 발송 실패' }, { status: 500 });
  }
}