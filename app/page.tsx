'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribeUser = async () => {
    if ('serviceWorker' in navigator) {
      try {
        // 1. 서비스 워커 등록 확인
        const register = await navigator.serviceWorker.register('/sw.js');
        
        // 2. 알림 권한 요청 및 구독 생성
        const subscription = await register.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        // 3. 구독 정보(토큰)를 Next.js 백엔드로 전송하여 DB 대신 메모리/파일에 보관 요청
        await fetch('/api/subscribe', {
          method: 'POST',
          body: JSON.stringify(subscription),
          headers: { 'Content-Type': 'application/json' },
        });

        setIsSubscribed(true);
        alert('알림 구독 성공! 이제 10시 45분 배너 알림을 기다리세요. (창을 닫으셔도 됩니다)');
      } catch (error) {
        console.error('구독 실패:', error);
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1>⏰ Next.js 정각/지정 시각 알림 서비스</h1>
      <p>아래 버튼을 눌러 내 브라우저를 등록하면 창을 닫아도 알림이 옵니다.</p>
      <button 
        onClick={subscribeUser} 
        disabled={isSubscribed}
        style={{ padding: '15px 30px', fontSize: '16px', background: isSubscribed ? '#6c757d' : '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        {isSubscribed ? '🔔 알림 구독 완료됨' : '🔔 10시 45분 알림 구독하기'}
      </button>
    </div>
  );
}