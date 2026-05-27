import { NextResponse } from 'next/server';

// 실무에서는 데이터베이스(DB)에 저장해야 하지만, 테스트를 위해 전역 변수(배열)에 임시 보관합니다.
export const subscriptions: any[] = [];

export async function POST(request: Request) {
  const subscription = await request.json();
  
  // 중복 체크 후 주소록에 추가
  if (!subscriptions.some(sub => sub.endpoint === subscription.endpoint)) {
    subscriptions.push(subscription);
  }
  
  return NextResponse.json({ success: true });
}