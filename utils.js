// utils.js
if (typeof localforage !== 'undefined') {
    window.DB_CACHE = localforage.createInstance({ name: 'SAIS_DB_CACHE' });
    window.DB_QUEUE = localforage.createInstance({ name: 'SAIS_OFFLINE_QUEUE' });
} else {
    window.DB_CACHE = { getItem: async () => null, setItem: async () => null };
    window.DB_QUEUE = { getItem: async () => [], setItem: async () => null };
}

window.SAIS_UTILS = {
    getLocalDateString: (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    getMapEmbedUrl: (link) => {
        if (!link) return null;
        if (String(link).includes("output=embed")) return link;
        try {
            let latLng = "";
            const regexAt = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
            const matchAt = String(link).match(regexAt);
            const regexDirect = /^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/;
            const matchDirect = String(link).match(regexDirect);
            if (matchAt) latLng = `${matchAt[1]},${matchAt[2]}`;
            else if (matchDirect) latLng = `${matchDirect[1]},${matchDirect[2]}`;
            
            if (latLng) return `https://maps.google.com/maps?q=${latLng}&hl=th&z=16&output=embed`;
            return `https://maps.google.com/maps?q=${encodeURIComponent(link)}&hl=th&z=16&output=embed`;
        } catch (e) { return null; }
    },
    exportToCSV: (bookingsData) => {
        if (!bookingsData || bookingsData.length === 0) { alert("ไม่มีข้อมูลสำหรับ Export"); return; }
        const headers = ["วันที่จอง", "Eq No.", "Unit", "โครงการ", "พื้นที่", "ประเภทงาน", "ผู้ตรวจ", "สถานะ Layout", "สถานะ Wiring", "สถานะ Pre-check", "ผู้จอง", "สถานะงาน"];
        const rows = bookingsData.map(b => [
            b.date ? String(b.date).split('T')[0] : '',
            `"${b.equipment_no || ''}"`, `"${b.unit_no || ''}"`, `"${b.site_name || ''}"`,
            b.area || '', b.job_type || '', b.inspector_name || '',
            String(b.layout_doc) === 'true' ? 'ผ่าน' : 'รอตรวจ', 
            String(b.wiring_doc) === 'true' ? 'ผ่าน' : 'รอตรวจ', 
            String(b.precheck_doc) === 'true' ? 'ผ่าน' : 'รอตรวจ',
            b.created_by || '', b.status || ''
        ]);
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `SAIS_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }
};
