// 📍 กำหนดเวอร์ชันของ Cache (หากมีการแก้โค้ดครั้งใหญ่ ให้มาเปลี่ยนเลขตรงนี้ เช่น v1.0.1)
const CACHE_NAME = 'sais-app-cache-v1.0.0';

// 📍 รายชื่อไฟล์ทั้งหมดที่ประกอบกันเป็นแอปของคุณ
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './config.js',
    './utils.js',
    './Icons.jsx',
    './LoginModal.jsx',
    './AdminPanel.jsx',
    './BookingModal.jsx',
    './App.jsx'
];

// 1. ติดตั้ง Service Worker และโหลดไฟล์เข้า Cache
self.addEventListener('install', event => {
    self.skipWaiting(); // บังคับให้ Service Worker ตัวใหม่ทำงานทันที ไม่ต้องรอ
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

// 2. เคลียร์ Cache เก่าทิ้งเมื่อมีการอัปเดตเวอร์ชันใหม่ (แก้ปัญหาจอขาว)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('ล้างแคชเก่า:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. ระบบโหลดไฟล์แบบ Network-First (ดึงจากเน็ตก่อน ถ้าเน็ตหลุดค่อยดึงจาก Cache)
self.addEventListener('fetch', event => {
    // ข้ามการทำแคชสำหรับการเรียก API Google Apps Script
    if (event.request.url.includes('script.google.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // ถ้าโหลดจากเน็ตได้ปกติ ให้เอาไฟล์ใหม่ล่าสุดไปทับใน Cache ด้วย
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                var responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            })
            .catch(() => {
                // ถ้าเน็ตหลุด หรือ GitHub ล่ม ให้ดึงไฟล์จากความจำ (Cache) มาแสดงแทน
                return caches.match(event.request);
            })
    );
});
