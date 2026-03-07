// 📍 ตรวจสอบและสร้างฐานข้อมูลออฟไลน์ (IndexedDB) เพื่อความเร็ว
if (typeof localforage !== 'undefined') {
    window.DB_CACHE = localforage.createInstance({ name: 'SAIS_DB_CACHE' });
    window.DB_QUEUE = localforage.createInstance({ name: 'SAIS_OFFLINE_QUEUE' });
} else {
    window.DB_CACHE = { getItem: async () => null, setItem: async () => null };
    window.DB_QUEUE = { getItem: async () => [], setItem: async () => null };
}

window.SAIS_UTILS = {
    // 📍 ฟังก์ชันจัดการวันที่ให้ตรงกับ Timezone ท้องถิ่น (ไทย)
    getLocalDateString: (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    // 📍 ฟังก์ชันแปลงแผนที่ Google Maps (บังคับ HTTPS และเลี่ยงการโดนบล็อกจอเทา)
    getMapEmbedUrl: (link) => {
        if (!link) return null;
        let strLink = String(link).trim();
        
        // บังคับใช้ iframe มาตรฐานของ Google และบังคับเป็น HTTPS
        if (strLink.includes("output=embed") || strLink.includes("pb=")) {
            return strLink.replace("http://", "https://");
        }
        
        try {
            // เช็คว่าเป็นการใส่พิกัดแบบตรงๆ (เช่น 13.722,100.523 หรือ 13.722 , 100.523)
            const coordRegex = /^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/;
            const matchCoord = strLink.match(coordRegex);
            
            if (matchCoord) {
                // ส่งพิกัดไปแสดงผลใน iframe
                return `https://maps.google.com/maps?q=${matchCoord[1]},${matchCoord[2]}&hl=th&z=16&output=embed`;
            }
            // กรณีเป็นการพิมพ์ชื่อสถานที่ทั่วไป หรือเอาลิงก์สั้นมาวาง
            return `https://maps.google.com/maps?q=${encodeURIComponent(strLink)}&hl=th&z=16&output=embed`;
        } catch (e) { return null; }
    },

    // 📍 ระบบ Export ไฟล์เป็น Excel (CSV)
    exportToCSV: (bookingsData) => {
        if (!bookingsData || bookingsData.length === 0) { alert("ไม่มีข้อมูลให้ดาวน์โหลด"); return; }
        
        const headers = ["วันที่", "Eq No.", "Product Line", "Unit", "โครงการ", "พื้นที่", "ประเภท", "ผู้ตรวจ", "Layout", "Wiring", "Pre-check", "ผู้จอง"];
        
        const rows = bookingsData.map(b => [
            b.date ? String(b.date).split('T')[0] : '', 
            `"${b.equipment_no || ''}"`, 
            `"${b.product_line || ''}"`, 
            `"${b.unit_no || ''}"`, 
            `"${b.site_name || ''}"`, 
            b.area || '', 
            b.job_type || '', 
            b.inspector_name || '',
            String(b.layout_doc) === 'true' ? 'ส่งแล้ว' : 'ยังไม่ส่ง', 
            String(b.wiring_doc) === 'true' ? 'ส่งแล้ว' : 'ยังไม่ส่ง', 
            String(b.precheck_doc) === 'true' ? 'ส่งแล้ว' : 'ยังไม่ส่ง', 
            b.created_by || ''
        ]);

        let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a"); 
        link.setAttribute("href", encodeURI(csvContent)); 
        link.setAttribute("download", `SAIS_Report_${new Date().getTime()}.csv`); 
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link);
    },

    // 📍 ฟังก์ชันยิง API แบบมีระบบย้ำ (Exponential Backoff) ป้องกันการหลุดหรือชนโควตา
    fetchWithRetry: async (url, options, retries = 3, delay = 2000) => {
        try {
            const res = await fetch(url, options);
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (err) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return window.SAIS_UTILS.fetchWithRetry(url, options, retries - 1, delay * 2);
            } else { 
                throw err; 
            }
        }
    },

    // 📍 ฟังก์ชันบีบอัดรูปภาพก่อนอัปโหลดขึ้น Google Drive เพื่อไม่ให้เน็ตเปลืองและโหลดไว
    compressImage: (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // บีบให้ความกว้างเหลือแค่ 800px 
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH; 
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.6)); // ลดคุณภาพเหลือ 60%
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
};
