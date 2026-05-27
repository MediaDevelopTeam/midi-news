self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    
    // 외부에 잠들어있던 브라우저를 깨워 알림을 띄웁니다.
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828640.png',
      })
    );
  }
});