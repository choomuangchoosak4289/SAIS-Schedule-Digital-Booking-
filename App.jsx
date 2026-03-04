const { useState, useEffect, useMemo, useRef } = React;

const Icons = {
    Book: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    List: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    LogOut: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    ChevronLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
    ChevronRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
    Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
    Alert: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    MapPin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    FileCheck: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 16 12"/></svg>,
    MessageSquare: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    Home: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    Shield: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    WifiOff: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
    Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
};

const App = () => {
    const [db, setDb] = useState({ bookings: [], users: [], history: [], inspectors: [] });
    const [user, setUser] = useState(null);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [currentView, setCurrentView] = useState('calendar');
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(null); 
    const [showLogin, setShowLogin] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const [alertMsg, setAlertMsg] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [toast, setToast] = useState(null);
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [period, setPeriod] = useState(new Date().getDate() > 15 ? 1 : 0); 
    
    const [areaSelection, setAreaSelection] = useState('กรุงเทพและปริมณฑล');
    const [jobTypeSelection, setJobTypeSelection] = useState('New');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterArea, setFilterArea] = useState('All');
    const [filterJobType, setFilterJobType] = useState('All');
    const [selectedDocs, setSelectedDocs] = useState([]);

    const [currentTime, setCurrentTime] = useState(new Date());
    const [liveMapUrl, setLiveMapUrl] = useState('');
    const [isDecodingMap, setIsDecodingMap] = useState(false);
    const scrollRef = useRef(null);

    const isAdmin = useMemo(() => user?.username === window.SAIS_CONFIG.ADMIN_USERNAME || user?.role === 'admin', [user]);

    useEffect(() => {
        const initLocalData = async () => {
            const cachedUser = localStorage.getItem('sais_user');
            if (cachedUser) setUser(JSON.parse(cachedUser));
            const cachedDb = await window.DB_CACHE.getItem('db');
            if (cachedDb && typeof cachedDb === 'object') setDb(cachedDb);
        };
        initLocalData();
    }, []);

    useEffect(() => {
        const processOfflineQueue = async () => {
            const queue = await window.DB_QUEUE.getItem('queue') || [];
            if (queue.length > 0) {
                showToast(`กำลังซิงค์ข้อมูล... (${queue.length})`, 'alert');
                let newQueue = [...queue];
                for (let i = 0; i < queue.length; i++) {
                    try {
                        const res = await fetch(window.SAIS_CONFIG.SCRIPT_URL, { method: 'POST', body: JSON.stringify(queue[i]) });
                        if (res.ok) newQueue.shift();
                    } catch (e) { break; }
                }
                await window.DB_QUEUE.setItem('queue', newQueue);
                fetchData();
                if (newQueue.length === 0) showToast('ซิงค์สำเร็จ!', 'success');
            }
        };

        const handleOnline = () => { setIsOffline(false); showToast('กลับมาออนไลน์แล้ว', 'success'); processOfflineQueue(); };
        const handleOffline = () => { setIsOffline(true); showToast('ออฟไลน์โหมด', 'alert'); };
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
    }, []);

    useEffect(() => {
        if (!isOffline) fetchData();
        const timer = setInterval(() => {
            if (!isOffline && !modal && !showLogin && !showManual && !confirmDialog && !alertMsg) fetchData();
        }, 180000); 
        return () => clearInterval(timer);
    }, [isOffline, modal, showLogin, showManual, confirmDialog, alertMsg]);

    const fetchData = async () => {
        if (!window.SAIS_CONFIG.SCRIPT_URL || isOffline) return;
        try {
            const res = await fetch(window.SAIS_CONFIG.SCRIPT_URL);
            if (!res.ok) throw new Error('Network error');
            const data = await res.json();
            if (data) {
                const newData = { bookings: data.bookings || [], users: data.users || [], history: data.history || [], inspectors: data.inspectors || [] };
                setDb(newData);
                await window.DB_CACHE.setItem('db', newData);
            }
        } catch (e) { console.error("Fetch Error:", e); }
    };

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

    const apiAction = async (payload, optimisticBookingData = null) => {
        let previousBookings = [...db.bookings];
        if (optimisticBookingData) {
            if (payload.action === 'create_booking') setDb(prev => ({ ...prev, bookings: [...prev.bookings, optimisticBookingData] }));
            else if (payload.action === 'update_booking') setDb(prev => ({ ...prev, bookings: prev.bookings.map(b => b.id === payload.id ? optimisticBookingData : b) }));
            else if (payload.action === 'delete_booking') setDb(prev => ({ ...prev, bookings: prev.bookings.filter(b => b.id !== payload.id) }));
        }

        if (isOffline) {
            const queue = await window.DB_QUEUE.getItem('queue') || [];
            queue.push(payload);
            await window.DB_QUEUE.setItem('queue', queue);
            showToast('บันทึกออฟไลน์แล้ว', 'alert');
            return true;
        }

        setLoading(true);
        try {
            const res = await fetch(window.SAIS_CONFIG.SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
            const result = await res.json();
            setLoading(false);
            
            if (result.status === 'ok') { await fetchData(); return true; } 
            else { setDb(prev => ({ ...prev, bookings: previousBookings })); setAlertMsg('ข้อผิดพลาด: ' + (result.message || 'ไม่ทราบสาเหตุ')); return false; }
        } catch (e) { 
            setLoading(false); setDb(prev => ({ ...prev, bookings: previousBookings })); setAlertMsg('การเชื่อมต่อขัดข้อง'); return false; 
        }
    };

    const handleBatchApprove = async () => {
        if (selectedDocs.length === 0) return;
        setConfirmDialog({
            msg: `ต้องการอนุมัติเอกสารทั้ง ${selectedDocs.length} รายการใช่หรือไม่?`,
            onConfirm: async () => {
                let successCount = 0; setLoading(true);
                for (let id of selectedDocs) {
                    const booking = db.bookings.find(b => b.id === id);
                    if(booking) {
                        const payload = { action: 'update_booking', id: id, user: user.username, layout_doc: 'true', wiring_doc: 'true', precheck_doc: 'true' };
                        const updatedBooking = { ...booking, layout_doc: 'true', wiring_doc: 'true', precheck_doc: 'true' };
                        const ok = await apiAction(payload, updatedBooking);
                        if(ok) successCount++;
                    }
                }
                setLoading(false); setSelectedDocs([]);
                if(successCount > 0) showToast(`อนุมัติสำเร็จ ${successCount} รายการ`, 'success');
            }
        });
    };

    const handleMapChange = async (val) => {
        if (!val) { setLiveMapUrl(''); return; }
        const parsedUrl = window.SAIS_UTILS.getMapEmbedUrl(val);
        if (parsedUrl) { setLiveMapUrl(parsedUrl); return; }
        if (isOffline) { setLiveMapUrl(`http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(val)}&hl=th&z=16&output=embed`); return; }

        if (String(val).includes("goo.gl")) {
            setIsDecodingMap(true);
            try {
                const res = await fetch(window.SAIS_CONFIG.SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'preview_map', link: String(val) }) });
                const data = await res.json();
                if (data.status === 'ok') setLiveMapUrl(data.embedUrl);
            } catch (e) {}
            setIsDecodingMap(false);
        } else {
            setLiveMapUrl(`http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(val)}&hl=th&z=16&output=embed`);
        }
    };

    useEffect(() => {
        if (modal && modal.type === 'booking') handleMapChange(modal.data.map_link || '');
        else setLiveMapUrl('');
    }, [modal]);

    const changePeriod = (dir) => {
        let newDate = new Date(currentDate);
        if (dir === 'next') {
            if (period === 0) setPeriod(1); 
            else { setPeriod(0); newDate.setMonth(newDate.getMonth() + 1); setCurrentDate(newDate); }
        } else {
            if (period === 1) setPeriod(0); 
            else { setPeriod(1); newDate.setMonth(newDate.getMonth() - 1); setCurrentDate(newDate); }
        }
    };

    const todayLocalString = window.SAIS_UTILS.getLocalDateString(new Date());

    // 📍 ระบบป้องกัน WSOD: แปลงเป็น String เสมอ
    const filteredBookings = useMemo(() => {
        return (db.bookings || []).filter(b => {
            const searchStr = String(searchQuery || '').toLowerCase();
            const eqMatch = String(b.equipment_no || '').toLowerCase().includes(searchStr);
            const siteMatch = String(b.site_name || '').toLowerCase().includes(searchStr);
            const foremanMatch = String(b.foreman || '').toLowerCase().includes(searchStr);
            const matchSearch = eqMatch || siteMatch || foremanMatch;
            const matchArea = filterArea === 'All' ? true : String(b.area || '') === filterArea;
            const matchJobType = filterJobType === 'All' ? true : String(b.job_type || '') === filterJobType;
            return matchSearch && matchArea && matchJobType;
        });
    }, [db.bookings, searchQuery, filterArea, filterJobType]);

    const daysInView = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const start = period === 0 ? 1 : 16;
        const end = period === 0 ? 15 : lastDay;
        const days = [];

        for (let i = 0; i < 16; i++) {
            const d = start + i;
            if (d <= end) {
                const date = new Date(year, month, d);
                const localDateStr = window.SAIS_UTILS.getLocalDateString(date);
                const isDbHoliday = (db.bookings || []).some(b => b.date && String(b.date).split('T')[0] === localDateStr && String(b.inspector_name) === 'SYSTEM_HOLIDAY');
                days.push({ full: localDateStr, day: d, weekday: date.toLocaleDateString('en-US', { weekday: 'short' }), isSunday: date.getDay() === 0, isHoliday: isDbHoliday, isToday: localDateStr === todayLocalString, isEmpty: false });
            } else { days.push({ isEmpty: true }); }
        }
        return days;
    }, [currentDate, period, db.bookings]);

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd);

        if (!user?.username) return setAlertMsg('กรุณาเข้าสู่ระบบก่อนทำรายการ');
        if (!/^\d{10}$/.test(data.tel)) return setAlertMsg('กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก');
        
        const formattedTel = String(data.tel); 
        let finalArea = areaSelection === 'other' ? (fd.get('custom_area') || 'ไม่ระบุ') : areaSelection;

        const isDup = (db.bookings || []).some(b => b.date && String(b.date).split('T')[0] === modal.data.date && String(b.equipment_no) === String(data.equipment_no) && b.id !== modal.data.id && String(b.inspector_name) !== 'SYSTEM_HOLIDAY');
        if (isDup) return setAlertMsg(`เลข Eq No. ${data.equipment_no} ถูกจองไปแล้วในวันนี้`);

        const payload = {
            action: modal.data.id ? 'update_booking' : 'create_booking',
            ...data, tel: formattedTel, area: finalArea, job_type: jobTypeSelection, 
            id: modal.data.id || `temp_${Date.now()}`,
            inspector_name: modal.data.inspector_name, date: modal.data.date, user: user.username
        };

        if (isAdmin) {
            payload.layout_doc = data.layout_doc ? 'true' : 'false';
            payload.wiring_doc = data.wiring_doc ? 'true' : 'false';
            payload.precheck_doc = data.precheck_doc ? 'true' : 'false';
        } else if (modal.data.id) {
            payload.layout_doc = String(modal.data.layout_doc || 'false');
            payload.wiring_doc = String(modal.data.wiring_doc || 'false');
            payload.precheck_doc = String(modal.data.precheck_doc || 'false');
        } else {
            payload.layout_doc = 'false'; payload.wiring_doc = 'false'; payload.precheck_doc = 'false';
        }

        const optimisticData = { ...payload, created_by: user.username, status: 'pending' };
        const ok = await apiAction(payload, optimisticData);
        if (ok) {
            setModal(null); setAreaSelection('กรุงเทพและปริมณฑล'); setJobTypeSelection('New'); setLiveMapUrl('');
            if(!isOffline) showToast(modal.data.id ? 'อัปเดตข้อมูลสำเร็จ!' : 'บันทึกสำเร็จ!', 'success');
        }
    };

    return (
        <div className="app-container">
            {toast && <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full shadow-2xl bg-white flex items-center gap-3 animate-pop font-bold text-sm border ${toast.type === 'alert' ? 'border-amber-400 text-amber-600' : 'border-green-400 text-green-600'}`}>{toast.type === 'success' ? <Icons.Check /> : <Icons.Alert />} {toast.msg}</div>}
            {isOffline && <div className="offline-badge"><Icons.WifiOff /> ออฟไลน์ (บันทึกได้ ระบบจะซิงค์ภายหลัง)</div>}

            <header className={`main-header ${user ? 'bg-slate-800' : 'bg-red-600'}`}>
                <div className="flex items-center gap-2"><h1 className="text-xl font-bold tracking-wide">SAIS BOOKING</h1></div>
                <div className="flex items-center gap-2">
                    <button className="btn-icon" onClick={() => setShowManual(true)}><Icons.Book /></button>
                    {!user ? <button className="ml-1 bg-white text-red-700 px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm" onClick={() => setShowLogin(true)}>LOGIN <Icons.User /></button>
                           : <div className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1"><Icons.User /> {user.username}</div>}
                </div>
            </header>

            <div className="bottom-nav">
                <div className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => setCurrentView('calendar')}><Icons.Home /> ปฏิทินจอง</div>
                <div className={`nav-item ${currentView === 'my_bookings' ? 'active' : ''}`} onClick={() => { if(!user) setShowLogin(true); else setCurrentView('my_bookings'); }}><Icons.List /> งานของฉัน</div>
                {isAdmin && <div className={`nav-item ${currentView === 'admin' ? 'active' : ''}`} onClick={() => setCurrentView('admin')}><Icons.Shield /> Admin</div>}
                {user && <div className="nav-item text-red-500 hover:text-red-600" onClick={() => setConfirmDialog({ msg: 'ต้องการออกจากระบบ?', onConfirm: () => { setUser(null); localStorage.removeItem('sais_user'); setCurrentView('calendar'); showToast('ออกจากระบบแล้ว', 'success'); } })}><Icons.LogOut /> ออกระบบ</div>}
            </div>

            {currentView === 'calendar' && (
                <div className="grid-container">
                    <div className="filter-bar">
                        <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 flex-1 shadow-sm">
                            <div className="text-slate-400"><Icons.Search /></div>
                            <input type="text" placeholder="ค้นหา Eq..." className="w-full text-xs p-2 outline-none border-none bg-transparent" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            {searchQuery && <button onClick={() => setSearchQuery('')} className="text-slate-400 p-1"><Icons.X /></button>}
                        </div>
                        <select className="text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none w-24 shadow-sm font-bold text-slate-600" value={filterArea} onChange={(e) => setFilterArea(e.target.value)}>
                            <option value="All">ทุกพื้นที่</option><option value="กรุงเทพและปริมณฑล">กทม.</option><option value="เชียงใหม่">เชียงใหม่</option><option value="ภูเก็ต">ภูเก็ต</option>
                        </select>
                    </div>

                    <div className="nav-bar bg-white px-3 py-2 border-b">
                        <div className="flex justify-between items-center w-full">
                            <button onClick={() => changePeriod('prev')} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-1"><Icons.ChevronLeft /> ย้อนกลับ</button>
                            <div className="text-center font-bold text-slate-800 text-sm">{period === 0 ? "1-15 " : `16-${new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()} `}{currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</div>
                            <button onClick={() => changePeriod('next')} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-1">ถัดไป <Icons.ChevronRight /></button>
                        </div>
                    </div>
                    
                    <div className="grid-wrapper" ref={scrollRef}>
                        <div className="calendar-grid" style={{ '--col-count': (db.inspectors || []).length || 1 }}>
                            <div className="sticky-corner text-[10px] font-bold">DATE</div>
                            {(db.inspectors || []).map((ins, i) => (
                                <div key={i} className="sticky-top">
                                    <div className="font-bold truncate w-full text-center px-1 text-[11px]">{ins.name || '-'}</div>
                                    <div className="text-[9px] font-bold uppercase text-slate-300">{ins.short || String(ins.name || '').substring(0,3)}</div>
                                </div>
                            ))}

                            {daysInView.map((d, index) => (
                                <React.Fragment key={index}>
                                    <div className={`sticky-left ${d.isSunday ? 'is-sunday-col' : ''} ${d.isToday ? 'is-today-row' : ''}`}>
                                        {!d.isEmpty && (<><span className="leading-none font-bold text-sm">{d.day}</span><span className="text-[9px] mt-0.5 font-bold uppercase opacity-80">{d.weekday}</span></>)}
                                    </div>
                                    {!d.isEmpty && (db.inspectors || []).map((ins, idx) => {
                                        const isHoliday = d.isHoliday || d.isSunday;
                                        const task = filteredBookings.find(b => b.date && String(b.date).split('T')[0] === d.full && String(b.inspector_name) === String(ins.name));
                                        const hasTask = !!task && String(task.inspector_name) !== 'SYSTEM_HOLIDAY';
                                        let cardTypeClass = 'card-type-default', areaClass = ''; 
                                        if (hasTask) {
                                            if (task.job_type === 'temporary power supply') cardTypeClass = 'card-type-temp';
                                            if (task.job_type === 'builder lift') cardTypeClass = 'card-type-builder';
                                            areaClass = (task.area && task.area !== 'กรุงเทพและปริมณฑล' && task.area !== 'ไม่ระบุ') ? 'area-upcountry' : 'area-bkk';
                                        }

                                        return (
                                            <div key={idx} className={`grid-cell cursor-pointer hover:bg-slate-50 ${isHoliday && !hasTask ? 'is-holiday-cell' : ''} ${d.isToday && !(isHoliday && !hasTask) ? 'is-today-row' : ''}`}
                                                onClick={() => {
                                                    if (hasTask) { setModal({ type: 'detail', data: task }); } 
                                                    else {
                                                        if (isHoliday && !isAdmin) return setAlertMsg('วันหยุดระบบไม่เปิดให้จองคิวครับ');
                                                        if (!user) return setShowLogin(true);
                                                        if (d.full < todayLocalString && !isAdmin) return setAlertMsg('ไม่สามารถจองคิวงานย้อนหลังได้ครับ');
                                                        setModal({ type: 'booking', data: { date: d.full, inspector_name: ins.name } });
                                                    }
                                                }}>
                                                {isHoliday && !hasTask && <div className="holiday-label-new">{d.isSunday ? '' : 'HOLIDAY'}</div>}
                                                {hasTask && (
                                                    <div className={`task-content ${cardTypeClass} ${areaClass}`}>
                                                        <div className="text-line-1">{task.equipment_no} <span className="font-normal opacity-70">/</span> {task.unit_no}</div>
                                                        <div className="text-line-2">{task.site_name}</div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {currentView === 'my_bookings' && (
                <div className="page-view">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Icons.List /> งานของฉัน</h2>
                    <div className="space-y-3">
                        {(db.bookings || []).filter(b => String(b.inspector_name) !== 'SYSTEM_HOLIDAY' && b.created_by === user?.username).sort((a, b) => new Date(b.date) - new Date(a.date)).map((h, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer" onClick={() => setModal({ type: 'detail', data: h })}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-slate-800 text-sm">{h.site_name || '-'}</div>
                                    <div className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{h.date ? String(h.date).split('T')[0] : '-'}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600">
                                    <div><b>Eq No:</b> {h.equipment_no || '-'}</div><div><b>Unit:</b> {h.unit_no || '-'}</div>
                                    <div><b>ผู้ตรวจสอบ:</b> {h.inspector_name || '-'}</div><div><b>พื้นที่:</b> {h.area || '-'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {currentView === 'admin' && isAdmin && (
                <div className="page-view">
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Icons.Shield /> Admin Dashboard</h2>
                        <button onClick={() => window.SAIS_UTILS.exportToCSV(db.bookings)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"><Icons.Download /> Export CSV</button>
                    </div>
                    {selectedDocs.length > 0 && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-xl mb-4 flex justify-between items-center animate-pop">
                            <span className="text-sm font-bold text-red-700">เลือกแล้ว {selectedDocs.length} รายการ</span>
                            <button onClick={handleBatchApprove} disabled={loading} className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md">อนุมัติเอกสารทั้งหมด</button>
                        </div>
                    )}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap">
                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                    <tr><th className="p-3 text-center">เลือก</th><th className="p-3">วันที่จอง</th><th className="p-3">Eq No.</th><th className="p-3">โครงการ</th><th className="p-3">ผู้จอง</th><th className="p-3 text-center">เอกสาร</th></tr>
                                </thead>
                                <tbody>
                                    {(db.bookings || []).filter(b => String(b.inspector_name) !== 'SYSTEM_HOLIDAY' && String(b.status) !== 'cancelled').sort((a, b) => new Date(b.date) - new Date(a.date)).map((h, i) => {
                                        const docsOk = String(h.layout_doc) === 'true' && String(h.wiring_doc) === 'true' && String(h.precheck_doc) === 'true';
                                        return (
                                            <tr key={i} className={`border-b border-slate-100 ${selectedDocs.includes(h.id) ? 'bg-red-50/50' : 'hover:bg-slate-50'}`}>
                                                <td className="p-3 text-center">{!docsOk && <input type="checkbox" className="w-4 h-4 accent-red-600" checked={selectedDocs.includes(h.id)} onChange={() => { setSelectedDocs(prev => prev.includes(h.id) ? prev.filter(docId => docId !== h.id) : [...prev, h.id]); }} />}</td>
                                                <td className="p-3 cursor-pointer" onClick={() => setModal({ type: 'detail', data: h })}>{h.date ? String(h.date).split('T')[0] : '-'}</td>
                                                <td className="p-3 font-bold text-slate-800 cursor-pointer" onClick={() => setModal({ type: 'detail', data: h })}>{h.equipment_no}</td>
                                                <td className="p-3 truncate max-w-[120px] cursor-pointer" onClick={() => setModal({ type: 'detail', data: h })}>{h.site_name}</td>
                                                <td className="p-3 cursor-pointer">{h.created_by}</td>
                                                <td className="p-3 text-center cursor-pointer" onClick={() => setModal({ type: 'detail', data: h })}>{docsOk ? <span className="text-green-600 font-bold">✅ ครบ</span> : <span className="text-amber-500 font-bold">⏳ รอตรวจ</span>}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {modal && (
                <div className="backdrop z-[150]">
                    <div className="modal-card">
                        <button onClick={() => setModal(null)} className="btn-close-modern"><Icons.X /></button>
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-6 border-b pb-4 pr-10">
                                <h3 className="text-xl font-bold text-slate-900">{modal.type === 'booking' ? 'จองคิวตรวจ' : 'รายละเอียด'}</h3>
                                <div className="text-xs text-red-600 font-bold uppercase mt-1">{modal.data.inspector_name} • {modal.data.date ? String(modal.data.date).split('T')[0] : ''}</div>
                            </div>
                            {modal.type === 'booking' ? (
                                <form onSubmit={handleBookingSubmit} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500">พื้นที่ตรวจ (Area)</label>
                                            <select value={areaSelection} onChange={(e) => setAreaSelection(e.target.value)} className="bg-slate-50">
                                                <option value="กรุงเทพและปริมณฑล">กทม. และปริมณฑล</option><option value="เชียงใหม่">เชียงใหม่</option><option value="ภูเก็ต">ภูเก็ต</option><option value="other">จังหวัดอื่นๆ</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500">ประเภทงาน (Job Type)</label>
                                            <select value={jobTypeSelection} onChange={(e) => setJobTypeSelection(e.target.value)} className="bg-slate-50">
                                                <option value="New">New</option><option value="MOD">MOD</option><option value="temporary power supply">Temp. Power Supply</option><option value="builder lift">Builder Lift</option>
                                            </select>
                                        </div>
                                    </div>
                                    {areaSelection === 'other' && <div><input name="custom_area" required placeholder="พิมพ์ชื่อจังหวัดที่นี่..." className="bg-slate-50" /></div>}
                                    <div><label className="text-xs font-bold text-slate-500">Project Name</label><input name="site_name" defaultValue={modal.data.site_name} required placeholder="ชื่อโครงการ" /></div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="text-xs font-bold text-slate-500">Eq No.</label><input name="equipment_no" defaultValue={modal.data.equipment_no} required placeholder="XXXX" /></div>
                                        <div><label className="text-xs font-bold text-slate-500">Unit</label><input name="unit_no" defaultValue={modal.data.unit_no} required placeholder="A1" /></div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-500">Google map</label>
                                        <input name="map_link" defaultValue={modal.data.map_link} placeholder="ใส่ชื่อหรือวางพิกัด" onChange={(e) => { if (window.mapTimeout) clearTimeout(window.mapTimeout); window.mapTimeout = setTimeout(() => handleMapChange(e.target.value), 800); }} className="bg-slate-50" />
                                        {(liveMapUrl || isDecodingMap) && (
                                            <div className="map-preview relative mt-2 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                                {isDecodingMap ? <div className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-600">กำลังเชื่อมต่อ...</div> : <iframe width="100%" height="100%" frameBorder="0" src={liveMapUrl} loading="lazy"></iframe>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="text-xs font-bold text-slate-500">Foreman</label><input name="foreman" defaultValue={modal.data.foreman} placeholder="ชื่อผู้ควบคุมงาน" /></div>
                                        <div><label className="text-xs font-bold text-slate-500">Tel</label><input name="tel" defaultValue={modal.data.tel ? String(modal.data.tel).padStart(10, '0') : ''} type="tel" pattern="\d{10}" maxLength="10" required placeholder="เบอร์โทร 10 หลัก" /></div>
                                    </div>
                                    <div><label className="text-xs font-bold text-slate-500">หมายเหตุ</label><textarea name="notes" defaultValue={modal.data.notes} rows="2" className="bg-slate-50 resize-none"></textarea></div>

                                    {isAdmin && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl mt-2">
                                            <div className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1"><Icons.FileCheck /> ADMIN CHECKLIST</div>
                                            <div className="flex flex-col gap-2">
                                                <label className="admin-check-item"><input type="checkbox" name="layout_doc" defaultChecked={String(modal.data.layout_doc) === 'true'} /> Layout Drawings</label>
                                                <label className="admin-check-item"><input type="checkbox" name="wiring_doc" defaultChecked={String(modal.data.wiring_doc) === 'true'} /> Wiring Diagram</label>
                                                <label className="admin-check-item"><input type="checkbox" name="precheck_doc" defaultChecked={String(modal.data.precheck_doc) === 'true'} /> Pre-check</label>
                                            </div>
                                        </div>
                                    )}

                                    <button disabled={loading} className={`w-full py-3 mt-4 rounded-xl font-bold text-sm shadow-md transition-all ${loading ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-red-600 text-white active:bg-red-700'}`}>
                                        {loading ? 'กำลังบันทึกข้อมูล...' : (modal.data.id ? 'อัปเดตข้อมูล' : 'ยืนยันการจอง')}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-slate-900">{modal.data.site_name || '-'}</h2>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-y-4 text-sm">
                                        <div><span className="text-xs text-slate-400 block font-bold">Eq No.</span><b>{modal.data.equipment_no || '-'}</b></div>
                                        <div><span className="text-xs text-slate-400 block font-bold">Unit</span><b>{modal.data.unit_no || '-'}</b></div>
                                        <div><span className="text-xs text-slate-400 block font-bold">Foreman</span><b>{modal.data.foreman || '-'}</b></div>
                                        <div><span className="text-xs text-slate-400 block font-bold">Tel</span>{modal.data.tel ? <a href={`tel:${String(modal.data.tel).padStart(10, '0')}`} className="text-blue-600 font-bold">{String(modal.data.tel).padStart(10, '0')}</a> : <b>-</b>}</div>
                                    </div>
                                    <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="text-xs font-bold text-slate-500 mb-2">ADMIN CHECKLIST</div>
                                        <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-center">
                                            <div className={`p-2 rounded border ${String(modal.data.layout_doc) === 'true' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>Layout<br/>{String(modal.data.layout_doc) === 'true' ? '✅ ผ่าน' : '❌ รอตรวจ'}</div>
                                            <div className={`p-2 rounded border ${String(modal.data.wiring_doc) === 'true' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>Wiring<br/>{String(modal.data.wiring_doc) === 'true' ? '✅ ผ่าน' : '❌ รอตรวจ'}</div>
                                            <div className={`p-2 rounded border ${String(modal.data.precheck_doc) === 'true' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>Pre-check<br/>{String(modal.data.precheck_doc) === 'true' ? '✅ ผ่าน' : '❌ รอตรวจ'}</div>
                                        </div>
                                    </div>
                                    {(isAdmin || user?.username === modal.data.created_by) && (
                                        <div className="flex gap-2 mt-4">
                                            <button onClick={() => { setAreaSelection(modal.data.area || 'กรุงเทพและปริมณฑล'); setJobTypeSelection(modal.data.job_type || 'New'); setModal({ type: 'booking', data: modal.data }); }} className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm bg-slate-50">แก้ไข</button>
                                            <button onClick={() => {
                                                setConfirmDialog({ msg: 'คุณแน่ใจหรือไม่ที่จะยกเลิกคิวงานนี้?', onConfirm: async () => {
                                                    const ok = await apiAction({ action: 'delete_booking', id: modal.data.id, user: user.username }, { ...modal.data });
                                                    if (ok) { setModal(null); if(!isOffline) showToast('ยกเลิกรายการสำเร็จ', 'success'); }
                                                }});
                                            }} className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 font-bold text-sm bg-red-50">ยกเลิกคิว</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showManual && (
                <div className="backdrop z-[200]">
                    <div className="modal-card p-6">
                        <button onClick={() => setShowManual(false)} className="btn-close-modern"><Icons.X /></button>
                        <h3 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2 flex items-center gap-2"><Icons.Book /> คู่มือการใช้งาน</h3>
                        <div className="text-sm text-slate-700 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-1">การใช้งานแบบออฟไลน์</h4>
                                <p className="text-slate-600 leading-relaxed">กดเมนู "เพิ่มลงในหน้าจอโฮม" เพื่อติดตั้งเว็บเป็นแอปพลิเคชัน สามารถกดจองคิวงานได้แม้ไม่มีอินเทอร์เน็ต ระบบจะซิงค์ให้อัตโนมัติ</p>
                            </div>
                        </div>
                        <button onClick={() => setShowManual(false)} className="w-full mt-4 py-3 bg-slate-800 text-white rounded-xl font-bold">รับทราบ</button>
                    </div>
                </div>
            )}

            {alertMsg && (
                <div className="backdrop z-[300]">
                    <div className="bg-white w-[85%] max-w-[320px] rounded-3xl p-6 text-center shadow-2xl animate-pop">
                        <div className="mx-auto w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4"><Icons.Alert /></div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">แจ้งเตือน</h3>
                        <p className="text-sm text-slate-600 mb-6">{alertMsg}</p>
                        <button onClick={() => setAlertMsg(null)} className="w-full py-3 bg-slate-100 text-slate-800 rounded-xl font-bold">ตกลง</button>
                    </div>
                </div>
            )}

            {confirmDialog && (
                <div className="backdrop z-[300]">
                    <div className="bg-white w-[85%] max-w-[320px] rounded-3xl p-6 text-center shadow-2xl animate-pop">
                        <div className="mx-auto w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4"><Icons.Alert /></div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">ยืนยัน</h3>
                        <p className="text-sm text-slate-600 mb-6">{confirmDialog.msg}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDialog(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold">ปิด</button>
                            <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">ยืนยัน</button>
                        </div>
                    </div>
                </div>
            )}

            {showLogin && (
                <div className="backdrop z-[250]">
                    <div className="modal-card p-6">
                        <button onClick={() => setShowLogin(false)} className="btn-close-modern"><Icons.X /></button>
                        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6 mt-2">เข้าสู่ระบบ</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (isOffline) return setAlertMsg('ไม่สามารถเข้าสู่ระบบขณะออฟไลน์ได้');
                            const fd = new FormData(e.target);
                            setLoading(true);
                            try {
                                const res = await fetch(window.SAIS_CONFIG.SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'login', username: fd.get('username'), password: fd.get('password') }) });
                                const result = await res.json();
                                setLoading(false);
                                if (result.status === 'ok') { setUser(result.user); setShowLogin(false); showToast('เข้าสู่ระบบสำเร็จ'); } 
                                else setAlertMsg(result.message || 'ชื่อผู้ใช้/รหัสผ่านผิด');
                            } catch (err) { setLoading(false); setAlertMsg('การเชื่อมต่อขัดข้อง'); }
                        }} className="space-y-4">
                            <input name="username" required placeholder="Username" className="bg-slate-50" />
                            <input name="password" type="password" required placeholder="Password" className="bg-slate-50" />
                            <button disabled={loading || isOffline} className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transition-all ${loading || isOffline ? 'bg-slate-400' : 'bg-red-600 active:scale-95'}`}>
                                {loading ? 'กำลังตรวจสอบ...' : 'LOGIN'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// 📍 ระบบ Error Boundary ป้องกันหน้าจอขาว (Fail-Safe)
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { console.error("App Crash:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-800 p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
                    <h2 className="text-xl font-bold mb-2">ระบบเกิดข้อผิดพลาด</h2>
                    <p className="text-sm text-slate-500 mb-6">ข้อมูลบางส่วนอาจไม่ตรงกับรูปแบบที่ระบบต้องการ กรุณารีเฟรชหน้าจอใหม่อีกครั้ง</p>
                    <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold shadow-md">รีเฟรชหน้าจอ</button>
                </div>
            );
        }
        return this.props.children;
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><App /></ErrorBoundary>);
