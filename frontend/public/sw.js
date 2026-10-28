
self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: "Mehaa Garments",
      body: event.data?.text() || "You have a new notification.",
    };
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Mehaa Garments",
      {
        body: data.body || "A new order notification has arrived.",
        icon: "/mehaa_favicon.webp",
        badge: "/mehaa_favicon.webp",
        tag: data.notificationId || "mehaa-notification",
        data: {
          url: data.url || "/admin/orders",
        },
      },
    ),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/admin/orders",
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then(async (clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin)) {
          await client.focus();

          if ("navigate" in client) {
            await client.navigate(targetUrl);
          }

          return;
        }
      }

      return self.clients.openWindow(targetUrl);
    }),
  );
});
