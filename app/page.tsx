'use client';

import { useState } from 'react';

export default function Home() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribeUser = async () => {
    if (!('serviceWorker' in navigator)) {
      alert('이 브라우저는 서비스 워커를 지원하지 않습니다.');
      return;
    }

    try {
      // 1단계: 서비스 워커 등록
      await navigator.serviceWorker.register('/sw.js');

      const readyRegister = await navigator.serviceWorker.ready;
      
      // 2단계: 구독 생성
      const subscription = await readyRegister.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

      alert('1단계 완료: 브라우저 알림 토큰 생성 성공! 이제 서버로 전송합니다.');

      // 3단계: Next.js 백엔드로 전송
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setIsSubscribed(true);
        // 최종 성공 얼럿
        alert('🎉 최종 연동 성공!\n내 브라우저 정보가 서버에 안전하게 등록되었습니다.\n이제 창을 완전히 닫고 11시 10분 알림을 기다리세요!');
      } else {
        alert('❌ 서버 전송 실패: 백엔드 API 응답이 올바르지 않습니다.');
      }

    } catch (error) {
      console.error('구독 실패 상세 에러:', error);
      alert(`❌ 알림 등록 실패!\n이유: ${error instanceof Error ? error.message : '알림 권한이 거부되었거나 키 설정이 잘못되었습니다.'}`);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1>⏰ Next.js 11시 20분 알림 서비스</h1>
      <p>아래 버튼을 눌러 테스트를 진행해 주세요.</p>
      <button 
        onClick={subscribeUser} 
        disabled={isSubscribed}
        style={{ 
          padding: '15px 30px', 
          fontSize: '16px', 
          background: isSubscribed ? '#6c757d' : '#28a745', // 성공 시 회색, 평소엔 초록색
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: isSubscribed ? 'default' : 'pointer' 
        }}
      >
        {isSubscribed ? '🔔 알림 주소록 등록 완료' : '🔔 11시 10분 알림 등록하기'}
      </button>
    </div>
  );
}