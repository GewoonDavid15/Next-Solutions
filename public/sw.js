/* Next Solutions service worker: push notifications and an offline page. Kept small on purpose. */
const OFFLINE = "/offline.html";
const CACHE = "ns-offline-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

// Only page navigations: when there is no connection, show the offline page instead of the browser error
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE)));
});

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { titel: event.data ? event.data.text() : "" }; }
  const title = data.titel || "Next Solutions";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.tekst || "",
      icon: "/pwa-icon/192.png",
      badge: "/pwa-icon/192.png",
      data: { link: typeof data.link === "string" && data.link.startsWith("/") ? data.link : "/klantportaal" },
      tag: data.tag || undefined,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.link || "/klantportaal", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
