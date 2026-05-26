self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification?.data?.link || '/';
  event.waitUntil(clients.openWindow(target));
});
