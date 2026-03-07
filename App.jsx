const { useState, useEffect, useMemo, useRef } = React;

const App = () => {
    const SCRIPT_URL = window?.SAIS_CONFIG?.SCRIPT_URL || "";
    const ADMIN_USERNAME = window?.SAIS_CONFIG?.ADMIN_USERNAME || "jiraphong2227";
    const utils = window?.SAIS_UTILS || {};

    const [db, setDb] = useState({ bookings: [], users: [], logs: [], notifications: [], inspectors: [] });
    const [user, setUser] = useState(() => { try { const saved = localStorage.getItem('sais_user'); return saved ? JSON.parse(saved) : null; } catch(e) { return null; } });
    
    const [initialLoad, setInitialLoad] = useState(true);
    const [loadingMsg, setLoadingMsg] = useState(null); 
    const [uploadingDoc, setUploadingDoc] = useState({ layout: false, wiring: false, precheck: false });

    const [alertMsg, setAlertMsg] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [promptDialog, setPromptDialog] = useState(null);
    const [toast, setToast] = useState(null);

    const [currentView, setCurrentView] = useState('calendar');
    const [modal, setModal] = useState(null); 
    const [showLogin, setShowLogin] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false); 
    const [showPassword, setShowPassword] = useState(false); 
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activityTab, setActivityTab] = useState('notif');
    const [showManual, setShowManual] = useState(false);
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [period, setPeriod] = useState(new Date().getDate() > 15 ? 1 : 0); 
    const [searchQuery, setSearchQuery] = useState('');
    const [filterArea, setFilterArea] = useState('All');
    
    const [areaSelection, setAreaSelection] = useState('กรุงเทพและปริมณฑล');
    const [jobTypeSelection, setJobTypeSelection] = useState('New');
    const [productLineSelection, setProductLineSelection] = useState('ES1,3300');
    
    const [adminTab, setAdminTab] = useState('menu'); 
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [adminUserFilter, setAdminUserFilter] = useState('all'); 
    const [adminUserSearch, setAdminUserSearch] = useState(''); 
    const [adminBookingsLimit, setAdminBookingsLimit] = useState(20);

    const [myBookingsTab, setMyBookingsTab] = useState('pending');
    const [myBookingsLimit, setMyBookingsLimit] = useState(20);
    const [actionMenuId, setActionMenuId] = useState(null); 
    const [logsLimit, setLogsLimit] = useState(20);

    const [leaveStartDate, setLeaveStartDate] = useState('');
    const [leaveEndDate, setLeaveEndDate] = useState('');
    const [leaveInspector, setLeaveInspector] = useState('');
    const [leaveType, setLeaveType] = useState('ลาพักร้อน');
    const [customLeaveType, setCustomLeaveType] = useState(''); 

    const [eventStartDate, setEventStartDate] = useState('');
    const [eventEndDate, setEventEndDate] = useState('');

    const [holidayStartDate, setHolidayStartDate] = useState('');
    const [holidayEndDate, setHolidayEndDate] = useState('');

    const [liveMapUrl, setLiveMapUrl] = useState('');
    const scrollRef = useRef(null);

    const handleMapChange = (val) => {
        if (utils && typeof utils.getMapEmbedUrl === 'function') {
            setLiveMapUrl(utils.getMapEmbedUrl(val) || '');
        } else {
            setLiveMapUrl('');
        }
    };

    const leaveDates = useMemo(() => {
        if (!leaveStartDate || !leaveEndDate || !leaveInspector) return [];
        let start = new Date(leaveStartDate); let end = new Date(leaveEndDate);
        if (start > end) return [];
        let dates = []; let current = new Date(start);
        while (current <= end) {
            const localDateStr = utils.getLocalDateString ? utils.getLocalDateString(current) : current.toISOString().split('T')[0];
            const isSunday = current.getDay() === 0;
            const isGlobalHoliday = (db.bookings || []).some(b => b.date && String(b.date).split('T')[0] === localDateStr && String(b.inspector_name) === 'SYSTEM_HOLIDAY');
            if (!isSunday && !isGlobalHoliday) dates.push(localDateStr);
            current.setDate(current.getDate() + 1);
        } return dates;
    }, [leaveStartDate, leaveEndDate, leaveInspector, db.bookings, utils]);

    const eventDates = useMemo(() => {
        if (!eventStartDate || !eventEndDate) return [];
        let start = new Date(eventStartDate); let end = new Date(eventEndDate);
        if (start > end) return [];
        let dates = []; let current = new Date(start);
        while (current <= end) {
            const localDateStr = utils.getLocalDateString ? utils.getLocalDateString(current) : current.toISOString().split('T')[0];
            const isSunday = current.getDay() === 0;
            const isGlobalHoliday = (db.bookings || []).some(b => b.date && String(b.date).split('T')[0] === localDateStr && String(b.inspector_name) === 'SYSTEM_HOLIDAY');
            if (!isSunday && !isGlobalHoliday) dates.push(localDateStr);
            current.setDate(current.getDate() + 1);
        } return dates;
    }, [eventStartDate, eventEndDate, db.bookings, utils]);

    const holidayDates = useMemo(() => {
        if (!holidayStartDate || !holidayEndDate) return [];
        let start = new Date(holidayStartDate); let end = new Date(holidayEndDate);
        if (start > end) return [];
        let dates = []; let current = new Date(start);
        while (current <= end) {
            const localDateStr = utils.getLocalDateString ? utils.getLocalDateString(current) : current.toISOString().split('T')[0];
            if (current.getDay() !== 0) dates.push(localDateStr);
            current.setDate(current.getDate() + 1);
        } return dates;
    }, [holidayStartDate, holidayEndDate, utils]);

    const isAdmin = useMemo(() => user?.username === ADMIN_USERNAME || user?.role === 'admin', [user]);
    const unreadNotifs = useMemo(() => (db.notifications || []).filter(n => (n.target === user?.username || (isAdmin && n.target === 'ALL_ADMIN')) && String(n.isRead) !== 'true'), [db.notifications, user, isAdmin]);

    useEffect(() => {
        if (user) localStorage.setItem('sais_user', JSON.stringify(user));
        else localStorage.removeItem('sais_user');
    }, [user]);

    useEffect(() => {
        const load = async () => { await fetchData(); setInitialLoad(false); }
        if(SCRIPT_URL) load();
        const timer = setInterval(() => { if (!modal && !showLogin && !showActivityModal && !alertMsg && !confirmDialog && !promptDialog && !loadingMsg && SCRIPT_URL) fetchData(); }, 180000); 
        return () => clearInterval(timer);
    }, [modal, showLogin, showActivityModal, alertMsg, confirmDialog, promptDialog, loadingMsg, SCRIPT_URL]);

    const fetchData = async () => {
        if (!SCRIPT_URL || !utils.fetchWithRetry) return;
        try {
            const data = await utils.fetchWithRetry(SCRIPT_URL, { method: 'GET' });
            if (data) setDb({ bookings: data.bookings || [], users: data.users || [], logs: data.logs || [], notifications: data.notifications || [], inspectors: data.inspectors || [] });
        } catch (e) { console.error("Fetch Error"); }
    };

    const showSlideToast = (msg, type = 'success') => { 
        setToast({ msg, type }); setTimeout(() => setToast(null), 3500); 
    };

    const apiAction = async (payload, customLoadMsg = 'กำลังบันทึกข้อมูล...') => {
        if (!SCRIPT_URL) return false;
        setLoadingMsg(customLoadMsg);
        try {
            const result = await utils.fetchWithRetry(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
            setLoadingMsg(null);
            if (result.status === 'ok') { await fetchData(); return true; } 
            else { setAlertMsg(result.message || 'ไม่ทราบสาเหตุ'); return false; }
        } catch (e) { setLoadingMsg(null); setAlertMsg('การเชื่อมต่อขัดข้อง'); return false; }
    };

    const handleLogout = () => {
        setConfirmDialog({
            msg: 'ยืนยันการออกจากระบบใช่หรือไม่?',
            onConfirm: async () => {
                setConfirmDialog(null); setLoadingMsg('กำลังออกจากระบบ...'); setUser(null);
                try {
                    localStorage.clear(); sessionStorage.clear();
                    window.DB_CACHE && window.DB_CACHE.clear(); window.DB_QUEUE && window.DB_QUEUE.clear();
                    if ('caches' in window) caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))));
                } catch (error) {} finally { window.location.replace(window.location.pathname + '?logout=' + new Date().getTime()); }
            }
        });
    };

    const handleCancelBooking = (booking) => {
        setPromptDialog({
            msg: "โปรดระบุเหตุผลในการยกเลิกคิวงานนี้:",
            onSubmit: (reason) => {
                apiAction({ action: 'delete_booking', id: booking.id, user: user.username, reason: reason || 'ไม่ระบุเหตุผล' }, 'กำลังยกเลิกคิวงาน...').then(ok => {
                    if(ok) { setModal(null); setActionMenuId(null); showSlideToast('ยกเลิกคิวสำเร็จ', 'success'); }
                });
            }
        });
    };

    const markNotifAsRead = async (id) => {
        if (!SCRIPT_URL) return;
        setDb(prev => ({ ...prev, notifications: prev.notifications.map(n => n.id === id ? {...n, isRead: 'true'} : n) }));
        fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'read_notification', id: id }) });
    };

    const handleImageUpload = async (e, docType) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return setAlertMsg('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
        
        setUploadingDoc(prev => ({ ...prev, [docType]: true }));
        setLoadingMsg('กำลังบีบอัดและอัปโหลดรูปภาพ...');
        try {
            const base64Img = await utils.compressImage(file);
            const res = await utils.fetchWithRetry(SCRIPT_URL, {
                method: 'POST', body: JSON.stringify({ action: 'upload_image', base64: base64Img, mimeType: file.type, fileName: `SAIS_${docType}_${Date.now()}.jpg` })
            });
            if (res.status === 'ok') {
                document.getElementById(`${docType}_img_input`).value = res.fileUrl;
                showSlideToast(`อัปโหลดเอกสาร ${docType} สำเร็จ`, 'success');
            } else { setAlertMsg('อัปโหลดไม่สำเร็จ'); }
        } catch(err) { setAlertMsg('เกิดข้อผิดพลาดในการอัปโหลด'); }
        setLoadingMsg(null); setUploadingDoc(prev => ({ ...prev, [docType]: false }));
    };

    const handleDragStart = (e, taskId) => { e.dataTransfer.setData('taskId', taskId); };
    const handleDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); };
    const handleDragLeave = (e) => { e.currentTarget.classList.remove('drag-over'); };
    const handleDrop = async (e, targetDate, targetInspector) => {
        e.preventDefault(); e.currentTarget.classList.remove('drag-over');
        if (!isAdmin) return showSlideToast('เฉพาะแอดมินที่ย้ายคิวได้', 'alert');
        const taskId = e.dataTransfer.getData('taskId');
        const task = db.bookings.find(b => String(b.id) === String(taskId));
        if(!task) return;
        
        const isDup = db.bookings.some(b => String(b.date).split('T')[0] === targetDate && String(b.equipment_no) === String(task.equipment_no) && b.id !== taskId);
        if(isDup) return setAlertMsg('Eq No. นี้ถูกจองไปแล้วในวันเดียวกัน');

        setConfirmDialog({
            msg: `ย้ายคิว Eq: ${task.equipment_no} ไปยัง ${targetInspector} วันที่ ${targetDate}?`,
            onConfirm: async () => {
                setConfirmDialog(null);
                const ok = await apiAction({ action: 'update_booking', id: taskId, date: targetDate, inspector_name: targetInspector, user: user.username }, 'กำลังย้ายคิวงาน...');
                if(ok) showSlideToast('ย้ายคิวสำเร็จ', 'success');
            }
        });
    };

    const changePeriod = (dir) => {
        let newDate = new Date(currentDate);
        if (dir === 'next') { if (period === 0) setPeriod(1); else { setPeriod(0); newDate.setMonth(newDate.getMonth() + 1); setCurrentDate(newDate); } } 
        else { if (period === 1) setPeriod(0); else { setPeriod(1); newDate.setMonth(newDate.getMonth() - 1); setCurrentDate(newDate); } }
    };

    const todayLocalString = utils.getLocalDateString ? utils.getLocalDateString(new Date()) : new Date().toISOString().split('T')[0];
    
    const filteredBookings = useMemo(() => {
        return (db.bookings || []).filter(b => {
            const matchArea = filterArea === 'All' ? true : String(b.area || '') === filterArea;
            return matchArea;
        });
    }, [db.bookings, filterArea]);

    const daysInView = useMemo(() => {
        if(!utils.getLocalDateString) return [];
        const year = currentDate.getFullYear(); const month = currentDate.getMonth(); const lastDay = new Date(year, month + 1, 0).getDate();
        const start = period === 0 ? 1 : 16; const end = period === 0 ? 15 : lastDay; const days = [];
        for (let i = 0; i < 16; i++) {
            const d = start + i;
            if (d <= end) {
                const date = new Date(year, month, d); const localDateStr = utils.getLocalDateString(date);
                const globalHolidayItems = (db.bookings || []).filter(b => b.date && String(b.date).split('T')[0] === localDateStr && String(b.inspector_name) === 'SYSTEM_HOLIDAY');
                const globalEventItems = (db.bookings || []).filter(b => b.date && String(b.date).split('T')[0] === localDateStr && String(b.inspector_name) === 'SYSTEM_EVENT');
                
                days.push({ 
                    full: localDateStr, day: d, weekday: date.toLocaleDateString('en-US', { weekday: 'short' }), 
                    isSunday: date.getDay() === 0, 
                    isGlobalHoliday: globalHolidayItems.length > 0 || date.getDay() === 0, globalHolidays: globalHolidayItems,
                    isGlobalEvent: globalEventItems.length > 0, globalEvents: globalEventItems,
                    isToday: localDateStr === todayLocalString, isEmpty: false 
                });
            } else { days.push({ isEmpty: true }); }
        }
        return days;
    }, [currentDate, period, db.bookings]);

    const handleBookingSubmit = async (e) => {
        e.preventDefault(); const fd = new FormData(e.target); const data = Object.fromEntries(fd);
        if (!user?.username) return setAlertMsg('กรุณาเข้าสู่ระบบก่อนทำรายการ');
        
        let finalArea = areaSelection === 'other' ? (fd.get('custom_area') || 'ไม่ระบุ') : areaSelection;
        let finalProductLine = productLineSelection === 'อื่นๆโปรดระบุ' ? (fd.get('custom_product_line') || 'ไม่ระบุ') : productLineSelection;

        const isFromAdminPanel = modal.data?.isAdminOverride === true;
        const targetInspector = isFromAdminPanel ? fd.get('admin_inspector_target') : modal.data?.inspector_name;
        const targetDate = isFromAdminPanel ? fd.get('admin_date_target') : modal.data?.date;

        const isDup = (db.bookings || []).some(b => {
            const sameDate = b.date && String(b.date).split('T')[0] === targetDate;
            if (!sameDate) return false;
            if (b.id === modal.data?.id) return false;
            if (String(b.inspector_name) === 'SYSTEM_HOLIDAY') return false;
            if (String(b.equipment_no) === String(data.equipment_no)) return true;
            if (!isAdmin && String(b.inspector_name) === targetInspector) return true;
            return false;
        });

        if (isDup) return setAlertMsg(isAdmin ? `เลข Eq No. ${data.equipment_no} ถูกจองไปแล้วในวันนี้` : 'ผู้ตรวจคิวเต็มแล้วในวันนี้');
        if (!/^\d{10}$/.test(data.tel)) return setAlertMsg('กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก');

        const payload = {
            action: modal.data?.id ? 'update_booking' : 'create_booking',
            ...data, tel: String(data.tel), area: finalArea, job_type: jobTypeSelection, product_line: finalProductLine,
            id: modal.data?.id, inspector_name: targetInspector, date: targetDate, user: user.username,
            layout_img: fd.get('layout_img') || modal.data?.layout_img || '',
            wiring_img: fd.get('wiring_img') || modal.data?.wiring_img || '',
            precheck_img: fd.get('precheck_img') || modal.data?.precheck_img || ''
        };

        if (isAdmin) { payload.layout_doc = data.layout_doc ? 'true' : 'false'; payload.wiring_doc = data.wiring_doc ? 'true' : 'false'; payload.precheck_doc = data.precheck_doc ? 'true' : 'false'; } 
        else if (modal.data?.id) { payload.layout_doc = String(modal.data?.layout_doc || 'false'); payload.wiring_doc = String(modal.data?.wiring_doc || 'false'); payload.precheck_doc = String(modal.data?.precheck_doc || 'false'); } 
        else { payload.layout_doc = 'false'; payload.wiring_doc = 'false'; payload.precheck_doc = 'false'; }

        const ok = await apiAction(payload, modal.data?.id ? 'กำลังอัปเดตข้อมูล...' : 'กำลังบันทึกคิวงาน...');
        if (ok) { setModal(null); setAreaSelection('กรุงเทพและปริมณฑล'); setJobTypeSelection('New'); setProductLineSelection('ES1,3300'); setLiveMapUrl(''); showSlideToast(modal.data?.id ? 'แก้ไขคิวงานสำเร็จ!' : 'จองคิวงานสำเร็จ!', 'success'); }
    };

    if (!SCRIPT_URL) {
        return <div className="h-screen w-full flex items-center justify-center flex-col gap-4 p-8 text-center"><div className="text-4xl text-red-500"><Icons.Alert /></div><h2 className="text-xl font-bold text-slate-800">เกิดข้อผิดพลาด</h2><p className="text-slate-600 text-sm">ไม่พบการตั้งค่าเชื่อมต่อฐานข้อมูล (URL)</p></div>;
    }

    return (
        <div className="app-container">
            {toast && (
                <div className={`toast-slide flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl font-bold text-sm border bg-white ${toast.type === 'alert' ? 'border-amber-400 text-amber-600' : 'border-green-400 text-green-600'}`}>
                    {toast.type === 'success' ? <Icons.Check /> : <Icons.Alert />} {toast.msg}
                </div>
            )}

            {loadingMsg && (
                <div className="backdrop z-[500] gap-4">
                    <Icons.Loader />
                    <div className="text-white font-bold text-sm bg-slate-900/60 px-5 py-2.5 rounded-full border border-slate-700 shadow-xl">{loadingMsg}</div>
                </div>
            )}

            <header className={`main-header ${user ? 'bg-slate-800' : 'bg-red-600'}`}>
                <div className="flex items-center gap-2"><h1 className="text-xl font-bold tracking-wide">SAIS BOOKING</h1></div>
                <div className="flex items-center gap-2">
                    <button className="btn-icon" onClick={() => setShowManual(true)} title="คู่มือการใช้งาน"><Icons.Book /></button>
                    {user && (
                        <button className="btn-icon relative" onClick={() => setShowActivityModal(true)}>
                            <Icons.Bell />
                            {unreadNotifs.length > 0 && <span className="notif-dot animate-pulse"></span>}
                        </button>
                    )}
                    {!user ? <button className="ml-1 bg-white text-red-700 px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm" onClick={() => setShowLogin(true)}>LOGIN <Icons.User /></button>
                           : <div className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1"><Icons.User /> {user.username}</div>}
                </div>
            </header>

            <div className="bottom-nav">
                <div className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => setCurrentView('calendar')}><Icons.Home /> ปฏิทิน</div>
                <div className={`nav-item ${currentView === 'search' ? 'active' : ''}`} onClick={() => setCurrentView('search')}><Icons.Search /> ค้นหา</div>
                <div className={`nav-item ${currentView === 'my_bookings' ? 'active' : ''}`} onClick={() => { if(!user) setShowLogin(true); else setCurrentView('my_bookings'); }}><Icons.List /> งานฉัน</div>
                {isAdmin && <div className={`nav-item ${currentView === 'admin' ? 'active' : ''}`} onClick={() => { setCurrentView('admin'); setAdminTab('menu'); }}><Icons.Shield /> จัดการ</div>}
                {user && <div className="nav-item text-red-500 hover:text-red-600" onClick={handleLogout}><Icons.LogOut /> ออกระบบ</div>}
            </div>

            {currentView === 'calendar' && (
                <div className="grid-container">
                    <div className="nav-bar bg-white px-3 py-2 border-b">
                        <div className="flex justify-between items-center w-full">
                            <button onClick={() => changePeriod('prev')} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-1"><Icons.ChevronLeft /> ย้อนกลับ</button>
                            <div className="text-center font-bold text-slate-800 text-sm">{period === 0 ? "1-15 " : `16-${new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()} `}{currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</div>
                            <button onClick={() => changePeriod('next')} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-1">ถัดไป <Icons.ChevronRight /></button>
                        </div>
                    </div>
                    
                    <div className="grid-wrapper" ref={scrollRef}>
                        {initialLoad ? (
                            <div className="w-full h-full flex flex-col p-4 gap-2">
                                {[1,2,3,4,5,6].map(i => <div key={i} className="w-full h-16 skeleton rounded-lg"></div>)}
                            </div>
                        ) : (
                            <div className="calendar-grid" style={{ '--col-count': (db.inspectors || []).length || 1 }}>
                                <div className="sticky-corner text-[10px] font-bold">DATE</div>
                                {(db.inspectors || []).map((ins, i) => (
                                    <div key={i} className="sticky-top">
                                        <div className="font-bold truncate w-full text-center px-1 text-[11px] py-1">{ins.name || '-'}</div>
                                    </div>
                                ))}

                                {daysInView.map((d, index) => {
                                    let headerClass = '';
                                    if (d.isGlobalHoliday) headerClass = 'is-sunday-col';
                                    else if (d.isGlobalEvent) headerClass = 'is-global-event-col';

                                    return (
                                        <React.Fragment key={index}>
                                            <div className={`sticky-left ${headerClass} ${d.isToday ? 'is-today-row' : ''}`}>
                                                {!d.isEmpty && (<><span className="leading-none font-bold text-sm">{d.day}</span><span className="text-[9px] mt-0.5 font-bold uppercase opacity-80">{d.weekday}</span></>)}
                                            </div>
                                            
                                            {!d.isEmpty && (db.inspectors || []).map((ins, idx) => {
                                                const cellTasks = filteredBookings.filter(b => b.date && String(b.date).split('T')[0] === d.full && String(b.inspector_name) === String(ins.name) && String(b.status) !== 'cancelled');
                                                const hasTask = cellTasks.length > 0;
                                                const hasLeave = cellTasks.some(t => t.job_type === 'leave');
                                                
                                                let cellHolidayClass = '';
                                                if (!hasTask) {
                                                    if (d.isGlobalHoliday) cellHolidayClass = 'is-holiday-cell'; 
                                                    else if (d.isGlobalEvent) cellHolidayClass = 'is-global-event-cell'; 
                                                }

                                                return (
                                                    <div key={idx} 
                                                        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, d.full, ins.name)}
                                                        className={`grid-cell hover:bg-slate-50 ${cellHolidayClass} ${d.isToday && !cellHolidayClass ? 'is-today-row' : ''}`}
                                                        onClick={() => {
                                                            if (d.isGlobalHoliday && !isAdmin) return setAlertMsg('ระบบไม่เปิดให้จองคิวในวันหยุดนักขัตฤกษ์ครับ');
                                                            if (!user) return setShowLogin(true);
                                                            if (d.full < todayLocalString && !isAdmin) return setAlertMsg('ไม่สามารถจองคิวงานย้อนหลังได้ครับ');
                                                            setModal({ type: 'booking', data: { date: d.full, inspector_name: ins.name } });
                                                        }}>
                                                        
                                                        {d.isGlobalHoliday && d.globalHolidays.map((gh, ghi) => <div key={'gh'+ghi} className="holiday-label-new" style={{backgroundColor: '#D0021B'}}>{gh.site_name}</div>)}
                                                        {d.isGlobalEvent && !hasLeave && d.globalEvents.map((ge, gei) => <div key={'ge'+gei} className="holiday-label-new" style={{backgroundColor: '#22c55e'}}>{ge.site_name}</div>)}
                                                        
                                                        {cellTasks.map((task, tIdx) => {
                                                            let cardTypeClass = 'card-type-default', areaClass = ''; 
                                                            if (task.job_type === 'leave') cardTypeClass = 'card-type-leave';
                                                            else if (task.job_type === 'company_event') cardTypeClass = 'card-type-event';
                                                            else if (task.job_type === 'temporary power supply') cardTypeClass = 'card-type-temp';
                                                            else if (task.job_type === 'builder lift') cardTypeClass = 'card-type-builder';
                                                            
                                                            if (task.job_type !== 'leave' && task.job_type !== 'company_event') {
                                                                areaClass = (task.area && task.area !== 'กรุงเทพและปริมณฑล' && task.area !== 'ไม่ระบุ') ? 'area-upcountry' : 'area-bkk';
                                                            }

                                                            return (
                                                                <div key={task.id || tIdx} 
                                                                    draggable={isAdmin && task.job_type !== 'leave' && task.job_type !== 'company_event'} 
                                                                    onDragStart={(e) => handleDragStart(e, task.id)} 
                                                                    className={`task-content ${cardTypeClass} ${areaClass}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); 
                                                                        if (task.job_type === 'leave' || task.job_type === 'company_event') {
                                                                            if(isAdmin) setConfirmDialog({msg: 'ต้องการลบการตั้งค่านี้ใช่หรือไม่?', onConfirm: () => { setConfirmDialog(null); apiAction({action: 'delete_booking', id: task.id, user: user.username}, 'กำลังลบ...'); }});
                                                                        } else { setModal({ type: 'detail', data: task }); }
                                                                    }}>
                                                                    {task.job_type === 'leave' || task.job_type === 'company_event' ? (
                                                                        <div className="special-event-text">{task.site_name}</div>
                                                                    ) : (
                                                                        <>
                                                                            <div className="text-line-1">{task.equipment_no} <span className="font-normal opacity-70">/</span> {task.unit_no}</div>
                                                                            <div className="text-line-2">{task.site_name}</div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {currentView === 'search' && (
                <div className="page-view relative">
                    <div className="sticky top-0 bg-[#f1f5f9] z-10 pb-4 pt-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Icons.Search /> ค้นหางาน</h2>
                            <select className="text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none w-32 shadow-sm font-bold text-slate-600" value={filterArea} onChange={(e) => setFilterArea(e.target.value)}>
                                <option value="All">ทุกพื้นที่</option><option value="กรุงเทพและปริมณฑล">กทม.</option><option value="เชียงใหม่">เชียงใหม่</option><option value="ภูเก็ต">ภูเก็ต</option>
                            </select>
                        </div>
                        <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3 py-3 shadow-sm">
                            <div className="text-slate-400 mr-2"><Icons.Search /></div>
                            <input type="text" placeholder="พิมพ์ Eq No., โครงการ, หรือผู้ตรวจ..." className="w-full text-sm outline-none border-none bg-transparent font-bold text-slate-700" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                            {searchQuery && <button onClick={() => setSearchQuery('')} className="text-slate-400 p-1 bg-slate-100 rounded-full"><Icons.X /></button>}
                        </div>
                    </div>
                    
                    <div className="space-y-3 pb-10">
                        {searchQuery.trim() === '' && filterArea === 'All' ? (
                            <div className="text-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl mt-4">พิมพ์ข้อมูลหรือเลือกพื้นที่เพื่อเริ่มค้นหา...</div>
                        ) : (
                            (() => {
                                const searchResults = (db.bookings || []).filter(b => {
                                    if (String(b.inspector_name) === 'SYSTEM_HOLIDAY' || String(b.inspector_name) === 'SYSTEM_EVENT') return false;
                                    if (String(b.equipment_no).startsWith('LEAVE_') || String(b.equipment_no).startsWith('EVENT_')) return false;
                                    if (String(b.status) === 'cancelled') return false;
                                    
                                    const matchArea = filterArea === 'All' ? true : String(b.area || '') === filterArea;
                                    const s = searchQuery.toLowerCase();
                                    const matchSearch = String(b.equipment_no || '').toLowerCase().includes(s) || 
                                                        String(b.site_name || '').toLowerCase().includes(s) || 
                                                        String(b.inspector_name || '').toLowerCase().includes(s);
                                                        
                                    return matchArea && matchSearch;
                                }).sort((a, b) => new Date(b.date) - new Date(a.date));

                                if (searchResults.length === 0) return <div className="text-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl mt-4">ไม่พบข้อมูลที่ตรงกับการค้นหา</div>;
                                
                                return searchResults.slice(0, 50).map((h, i) => (
                                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-red-400 transition-all" onClick={() => setModal({ type: 'detail', data: h })}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold text-slate-800 text-sm truncate">{h.site_name || '-'}</div>
                                            <div className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100">{h.date ? String(h.date).split('T')[0] : '-'}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100">
                                            <div><span className="text-slate-400 text-[10px] block">Eq No.</span> <span className="font-bold text-slate-700">{h.equipment_no || '-'}</span></div>
                                            <div><span className="text-slate-400 text-[10px] block">ผู้ตรวจสอบ</span> <span className="font-bold text-slate-700">{h.inspector_name || '-'}</span></div>
                                            <div><span className="text-slate-400 text-[10px] block">Unit</span> <span className="font-bold text-slate-700">{h.unit_no || '-'}</span></div>
                                            <div><span className="text-slate-400 text-[10px] block">พื้นที่</span> <span className="font-bold text-slate-700">{h.area || '-'}</span></div>
                                        </div>
                                    </div>
                                ));
                            })()
                        )}
                    </div>
                </div>
            )}

            {currentView === 'my_bookings' && (
                <div className="page-view relative">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Icons.List /> งานที่ฉันจองไว้</h2>
                    
                    <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setMyBookingsTab('pending')} className={`flex-1 py-2 text-xs font-bold rounded-md ${myBookingsTab === 'pending' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}>⏳ รอดำเนินการ</button>
                        <button onClick={() => setMyBookingsTab('approved')} className={`flex-1 py-2 text-xs font-bold rounded-md ${myBookingsTab === 'approved' ? 'bg-white shadow-sm text-green-600' : 'text-slate-500'}`}>✅ อนุมัติแล้ว</button>
                        <button onClick={() => setMyBookingsTab('completed')} className={`flex-1 py-2 text-xs font-bold rounded-md ${myBookingsTab === 'completed' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>🗄️ ประวัติ</button>
                    </div>

                    <div className="space-y-3 pb-10">
                        {(() => {
                            const filteredTasks = (db.bookings || []).filter(b => {
                                if(String(b.inspector_name) === 'SYSTEM_HOLIDAY' || String(b.inspector_name) === 'SYSTEM_EVENT' || b.created_by !== user?.username) return false;
                                if(String(b.equipment_no).startsWith('LEAVE_') || String(b.equipment_no).startsWith('EVENT_')) return false;

                                const isDocsOk = String(b.layout_doc) === 'true' && String(b.wiring_doc) === 'true' && String(b.precheck_doc) === 'true';
                                const isPast = new Date(b.date) < new Date(todayLocalString); 

                                if (myBookingsTab === 'completed') return isPast;
                                if (myBookingsTab === 'approved') return isDocsOk && !isPast;
                                return !isDocsOk && !isPast; 
                            }).sort((a, b) => new Date(b.date) - new Date(a.date));

                            if (filteredTasks.length === 0) return <div className="text-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl">ไม่พบข้อมูลในหมวดหมู่นี้</div>;
                            
                            return (
                                <>
                                    {filteredTasks.slice(0, myBookingsLimit).map((h, i) => (
                                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative">
                                            {myBookingsTab === 'pending' && (
                                                <div className="absolute top-3 right-3 z-10">
                                                    <button onClick={() => setActionMenuId(actionMenuId === h.id ? null : h.id)} className="text-slate-400 hover:text-slate-800 p-1 bg-slate-50 rounded-md border"><Icons.MoreVertical /></button>
                                                    {actionMenuId === h.id && (
                                                        <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden text-xs">
                                                            <button onClick={() => { setAreaSelection(h.area || 'กรุงเทพและปริมณฑล'); setJobTypeSelection(h.job_type || 'New'); setProductLineSelection(h.product_line || 'ES1,3300'); setModal({ type: 'booking', data: h }); setActionMenuId(null); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-2">✏️ แก้ไขข้อมูล</button>
                                                            <button onClick={() => handleCancelBooking(h)} className="w-full text-left px-4 py-3 hover:bg-red-50 font-bold text-red-600 border-t border-slate-100 flex items-center gap-2">🗑️ ยกเลิกคิวงาน</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="cursor-pointer pr-10" onClick={() => setModal({ type: 'detail', data: h })}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-bold text-slate-800 text-sm truncate">{h.site_name || '-'}</div>
                                                </div>
                                                <div className="text-[10px] font-bold text-blue-600 mb-2">{h.date ? String(h.date).split('T')[0] : '-'}</div>
                                                <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600">
                                                    <div><b>Eq No:</b> {h.equipment_no || '-'}</div><div><b>Unit:</b> {h.unit_no || '-'}</div>
                                                    <div><b>ผู้ตรวจสอบ:</b> {h.inspector_name || '-'}</div><div><b>พื้นที่:</b> {h.area || '-'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {myBookingsLimit < filteredTasks.length && (
                                        <button onClick={() => setMyBookingsLimit(prev => prev + 20)} className="w-full py-3 bg-slate-200 text-slate-700 font-bold rounded-xl mt-4 active:scale-95 transition-all">
                                            โหลดรายการเพิ่มเติม... ({myBookingsLimit} / {filteredTasks.length})
                                        </button>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {currentView === 'admin' && isAdmin && (
                <AdminPanel 
                    db={db} user={user} isAdmin={isAdmin} adminTab={adminTab} setAdminTab={setAdminTab}
                    selectedDocs={selectedDocs} setSelectedDocs={setSelectedDocs} adminUserFilter={adminUserFilter}
                    setAdminUserFilter={setAdminUserFilter} adminUserSearch={adminUserSearch} setAdminUserSearch={setAdminUserSearch}
                    adminBookingsLimit={adminBookingsLimit} setAdminBookingsLimit={setAdminBookingsLimit}
                    leaveStartDate={leaveStartDate} setLeaveStartDate={setLeaveStartDate} leaveEndDate={leaveEndDate}
                    setLeaveEndDate={setLeaveEndDate} leaveInspector={leaveInspector} setLeaveInspector={setLeaveInspector}
                    leaveType={leaveType} setLeaveType={setLeaveType} customLeaveType={customLeaveType}
                    setCustomLeaveType={setCustomLeaveType} eventStartDate={eventStartDate} setEventStartDate={setEventStartDate}
                    eventEndDate={eventEndDate} setEventEndDate={setEventEndDate} holidayStartDate={holidayStartDate}
                    setHolidayStartDate={setHolidayStartDate} holidayEndDate={holidayEndDate} setHolidayEndDate={setHolidayEndDate}
                    leaveDates={leaveDates} eventDates={eventDates} holidayDates={holidayDates} setAlertMsg={setAlertMsg}
                    setConfirmDialog={setConfirmDialog} apiAction={apiAction} setLoadingMsg={setLoadingMsg} fetchData={fetchData}
                    showSlideToast={showSlideToast} SCRIPT_URL={SCRIPT_URL} setModal={setModal} handleCancelBooking={handleCancelBooking}
                    PRODUCT_COLORS={PRODUCT_COLORS} loadingMsg={loadingMsg} utils={utils}
                />
            )}

            {showActivityModal && (
                <div className="backdrop z-[200]">
                    <div className="modal-card p-6 h-[85vh]">
                        <button onClick={() => setShowActivityModal(false)} className="btn-close-modern"><Icons.X /></button>
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">ความเคลื่อนไหวในระบบ</h3>
                        
                        <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-lg">
                            <button onClick={() => setActivityTab('notif')} className={`flex-1 py-2 text-xs font-bold rounded-md ${activityTab === 'notif' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>แจ้งเตือน</button>
                            <button onClick={() => setActivityTab('logs')} className={`flex-1 py-2 text-xs font-bold rounded-md ${activityTab === 'logs' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>ประวัติระบบ</button>
                        </div>

                        <div className="overflow-y-auto flex-1 pr-2 space-y-3">
                            {activityTab === 'notif' && (
                                <>
                                    {(db.notifications || []).filter(n => n.target === user?.username || (isAdmin && n.target === 'ALL_ADMIN')).map((n, i) => (
                                        <div key={i} onClick={() => markNotifAsRead(n.id)} className={`p-3 rounded-xl border cursor-pointer transition-all ${String(n.isRead) === 'true' ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-blue-50 border-blue-200 shadow-sm'}`}>
                                            <div className="text-xs text-slate-800">{n.message}</div>
                                            <div className="text-[9px] text-slate-400 mt-1 text-right">{new Date(n.timestamp).toLocaleString('th-TH')}</div>
                                        </div>
                                    ))}
                                    {(db.notifications || []).filter(n => n.target === user?.username || (isAdmin && n.target === 'ALL_ADMIN')).length === 0 && <p className="text-center text-slate-400 text-sm py-10">ไม่มีข้อความใหม่</p>}
                                </>
                            )}
                            
                            {activityTab === 'logs' && (
                                <>
                                    {(db.logs || []).slice(0, logsLimit).map((log, i) => (
                                        <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                                                <span className="flex items-center gap-1 text-slate-600"><Icons.User /> {log.user}</span>
                                                <span>{log.timestamp}</span>
                                            </div>
                                            <div className="text-xs font-bold text-slate-800">
                                                <span className={`px-2 py-0.5 rounded text-[9px] mr-2 ${log.action.includes('CREATE') || log.action.includes('BOOKING') || log.action.includes('SET') ? 'bg-green-100 text-green-700' : log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-700' : log.action.includes('CANCEL') || log.action.includes('DELETE') ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-700'}`}>
                                                    {log.action}
                                                </span>
                                            </div>
                                            <div className="text-[11px] mt-2 text-slate-600 leading-relaxed whitespace-pre-wrap border-l-2 border-slate-300 pl-2">
                                                {log.details}
                                            </div>
                                        </div>
                                    ))}
                                    {logsLimit < (db.logs || []).length && (
                                        <button onClick={() => setLogsLimit(prev => prev + 20)} className="w-full py-2 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs mt-2">
                                            โหลดประวัติเพิ่มเติม...
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showManual && (
                <div className="backdrop z-[200]">
                    <div className="modal-card p-6">
                        <button onClick={() => setShowManual(false)} className="btn-close-modern"><Icons.X /></button>
                        <h3 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2 flex items-center gap-2"><Icons.Book /> คู่มือการใช้งานระบบ</h3>
                        <div className="text-sm text-slate-700 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1">👨‍💻 สำหรับบุคคลทั่วไป</h4>
                                <ul className="list-decimal pl-4 text-xs space-y-2 text-slate-600">
                                    <li>ดูตารางวันว่างของผู้ตรวจสอบแต่ละท่านได้แบบ Real-time</li>
                                    <li>หากต้องการจองคิว ให้กดปุ่ม <b className="text-red-600">LOGIN</b> มุมขวาบน เพื่อสมัครสมาชิก รอแอดมินอนุมัติ</li>
                                </ul>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-1">📋 สำหรับพนักงาน (การจองคิว)</h4>
                                <ul className="list-decimal pl-4 text-xs space-y-2 text-blue-800">
                                    <li><b>การจอง:</b> แตะที่ <b className="text-red-600">ช่องว่างสีขาว</b> ในตาราง ให้ตรงกับวันและชื่อผู้ตรวจ</li>
                                    <li><b>การจัดการ:</b> ไปที่แท็บ "งานของฉัน" กดจุด 3 จุด มุมขวาบนเพื่อแก้ไขหรือยกเลิกคิว (ระบบจะให้ระบุเหตุผลเสมอ)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modal && (
                <BookingModal 
                    modal={modal} setModal={setModal} handleBookingSubmit={handleBookingSubmit} isAdmin={isAdmin}
                    currentView={currentView} adminTab={adminTab} db={db} user={user}
                    productLineSelection={productLineSelection} setProductLineSelection={setProductLineSelection}
                    areaSelection={areaSelection} setAreaSelection={setAreaSelection} jobTypeSelection={jobTypeSelection}
                    setJobTypeSelection={setJobTypeSelection} liveMapUrl={liveMapUrl} handleMapChange={handleMapChange}
                    uploadingDoc={uploadingDoc} handleImageUpload={handleImageUpload} loadingMsg={loadingMsg}
                    handleCancelBooking={handleCancelBooking} utils={utils} SCRIPT_URL={SCRIPT_URL}
                />
            )}

            {alertMsg && (
                <div className="backdrop z-[600]">
                    <div className="bg-white w-[85%] max-w-[320px] rounded-3xl p-6 text-center shadow-2xl animate-pop">
                        <div className="mx-auto w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4"><Icons.Alert /></div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">แจ้งเตือน</h3>
                        <p className="text-sm text-slate-600 mb-6">{alertMsg}</p>
                        <button onClick={() => setAlertMsg(null)} className="w-full py-3 bg-slate-100 text-slate-800 rounded-xl font-bold">ตกลง</button>
                    </div>
                </div>
            )}

            {confirmDialog && (
                <div className="backdrop z-[600]">
                    <div className="bg-white w-[85%] max-w-[320px] rounded-3xl p-6 text-center shadow-2xl animate-pop">
                        <div className="mx-auto w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4"><Icons.Alert /></div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">ยืนยันการทำรายการ</h3>
                        <p className="text-sm text-slate-600 mb-6">{confirmDialog.msg}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDialog(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                            <button onClick={confirmDialog.onConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">ยืนยัน</button>
                        </div>
                    </div>
                </div>
            )}

            {promptDialog && (
                <div className="backdrop z-[600]">
                    <div className="bg-white w-[85%] max-w-[320px] rounded-3xl p-6 text-center shadow-2xl animate-pop">
                        <div className="mx-auto w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4"><Icons.Alert /></div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">ระบุเหตุผล</h3>
                        <p className="text-sm text-slate-600 mb-4">{promptDialog.msg}</p>
                        <input type="text" id="prompt-input" className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full text-sm mb-6 outline-none" placeholder="พิมพ์เหตุผลที่นี่..." autoFocus />
                        <div className="flex gap-3">
                            <button onClick={() => setPromptDialog(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                            <button onClick={() => {
                                const val = document.getElementById('prompt-input').value;
                                promptDialog.onSubmit(val);
                                setPromptDialog(null);
                            }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">ยืนยัน</button>
                        </div>
                    </div>
                </div>
            )}

            {showLogin && (
                <LoginModal 
                    isRegisterMode={isRegisterMode} setIsRegisterMode={setIsRegisterMode}
                    showPassword={showPassword} setShowPassword={setShowPassword}
                    setShowLogin={setShowLogin} setAlertMsg={setAlertMsg}
                    apiAction={apiAction} showSlideToast={showSlideToast}
                    setLoadingMsg={setLoadingMsg} setUser={setUser}
                    SCRIPT_URL={SCRIPT_URL} loadingMsg={loadingMsg}
                />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
