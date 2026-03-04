const CACHE_NAME = 'sais-app-cache-v1';

// ไฟล์โครงสร้างหลักที่ต้องโหลดเก็บไว้ในเครื่อง
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // Cache Library สำคัญต่างๆ เพื่อให้ออฟไลน์ทำงานได้
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap'
];

// 1. Install Event: โหลดไฟล์เข้า Cache เมื่อผู้ใช้เปิดเว็บครั้งแรก
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // บังคับให้ Service Worker ตัวใหม่ทำงานทันที
});

// 2. Activate Event: ล้าง Cache ตัวเก่าทิ้งเมื่อมีการอัปเดตเวอร์ชัน
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: เมื่อมีการดึงข้อมูล ให้หาจาก Cache ก่อน (Offline First สำหรับไฟล์ UI)
self.addEventListener('fetch', (event) => {
  // ข้ามการ Cache หากเป็นการยิง API ไปที่ Google Apps Script (เพราะเราจัดการที่ index.html แล้ว)
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  // สำหรับไฟล์ UI (HTML, CSS, JS) ให้ใช้กลยุทธ์ Stale-While-Revalidate หรือ Network First
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // ถ้าเจอใน Cache ให้ส่งคืนทันที (Zero-loading)
        if (response) {
          // แอบไปดึงข้อมูลใหม่มาอัปเดต Cache แบบเนียนๆ (Stale-While-Revalidate)
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          }).catch(() => { /* ปล่อยผ่านถ้าไม่มีเน็ต */ });
          
          return response;
        }
        
        // ถ้าไม่เจอใน Cache ให้ไปดึงจาก Network
        return fetch(event.request);
      })
  );
});
