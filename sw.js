/* Service worker — offline shell + cached paintings. Bump VERSION when you deploy changes. */
const VERSION = 'wlk-v10';
const CORE = [
    './', 'index.html', 'tailwind.css', 'styles.css', 'krathong-art.js', 'fortunes.js', 'app.js', 'manifest.webmanifest',
    'assets/icons/icon-192.png', 'assets/icons/icon-512.png',
    'assets/bg/th.jpg'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    // Never cache Firebase data
    if (/firebaseio\.com$|firebasedatabase\.app$/.test(url.hostname)) return;

    const sameOrigin = url.origin === self.location.origin;
    const isCdn = /fonts\.(googleapis|gstatic)\.com/.test(url.hostname);
    if (!sameOrigin && !isCdn) return;

    // HTML/JS/CSS: network first (fresh deploys), fall back to cache offline.
    if (sameOrigin && /\.(html|js|css|webmanifest)$|\/$/.test(url.pathname)) {
        e.respondWith(
            fetch(req).then(res => {
                const copy = res.clone();
                caches.open(VERSION).then(c => c.put(req, copy));
                return res;
            }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
        );
        return;
    }

    // Images, fonts, CDN: cache first.
    e.respondWith(
        caches.match(req).then(hit => hit || fetch(req).then(res => {
            if (res.ok || res.type === 'opaque') {
                const copy = res.clone();
                caches.open(VERSION).then(c => c.put(req, copy));
            }
            return res;
        }))
    );
});
