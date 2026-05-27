import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { subscriptions } from '../subscribe/route'; // 유저 주소록 (실무에선 DB)

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {

  try {
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
  } catch (initError) {
    console.error('VAPID 키 초기화 실패:', initError);
    return NextResponse.json({ error: '서버 키 설정 에러' }, { status: 500 });
  }

  // 1. 현재 한국 시간 기준 월/일 계산
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + kstOffset);
  
  const currentMonth = kstDate.getUTCMonth() + 1;
  const currentDate = kstDate.getUTCDate();
  const hours = kstDate.getUTCHours();
  const minutes = kstDate.getUTCMinutes();

  console.log(`[생일 크론 실행] 현재 시각: ${hours}시 ${minutes}분 (${currentMonth}월 ${currentDate}일)`);

  // 알림 내용 수정
  const payload = JSON.stringify({
    title: '⏰ 11시 10분 알림 테스트! 🎉',
    body: `현재 시간 ${hours}시 ${minutes}분입니다. 생일 알림 크론이 정상 작동했습니다!`,
  });

  // 3. 오늘 생일인 사람들에게 푸시 발송
  // (여기서는 테스트를 위해 등록된 모든 구독자에게 발송하되, 실제로는 생일자 필터링 로직이 들어갑니다)
  const pushPromises = subscriptions.map((sub) =>
    webpush.sendNotification(sub, payload).catch((err) => console.error('발송 에러:', err))
  );

  await Promise.all(pushPromises);

  return NextResponse.json({ 
    message: `${currentMonth}월 ${currentDate}일 생일 알림 발송 완료`, 
    sentCount: subscriptions.length 
  });
}