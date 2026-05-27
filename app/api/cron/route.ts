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
  
  const currentMonth = kstDate.getUTCMonth() + 1; // 1월~12월
  const currentDate = kstDate.getUTCDate();       // 1일~31일

  console.log(`[생일 크론 실행] 오늘 날짜: ${currentMonth}월 ${currentDate}일`);

  // 2. 임시 유저 데이터 (실무에서는 DB에서 오늘이 생일인 유저 목록을 쿼리로 긁어옵니다)
  // 예시: 유저의 구독 정보와 생일 데이터가 매칭되어 있다고 가정
  const payload = JSON.stringify({
    title: '🎂 생일 축하합니다! 🎉',
    body: '오늘 특별하고 행복한 하루 보내세요. 저희 서비스가 당신의 생일을 진심으로 축하합니다!',
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