const AdminPanel = (props) => {
    // แตกตัวแปรทั้งหมดให้ครบ
    const { 
        db, user, isAdmin, adminTab, setAdminTab, selectedDocs, setSelectedDocs, adminUserFilter, setAdminUserFilter, 
        adminUserSearch, setAdminUserSearch, adminBookingsLimit, setAdminBookingsLimit, leaveStartDate, setLeaveStartDate, 
        leaveEndDate, setLeaveEndDate, leaveInspector, setLeaveInspector, leaveType, setLeaveType, customLeaveType, 
        setCustomLeaveType, eventStartDate, setEventStartDate, eventEndDate, setEventEndDate, holidayStartDate, 
        setHolidayStartDate, holidayEndDate, setHolidayEndDate, leaveDates, eventDates, holidayDates, setAlertMsg, 
        setConfirmDialog, apiAction, setLoadingMsg, fetchData, showSlideToast, SCRIPT_URL, setModal, handleCancelBooking, 
        PRODUCT_COLORS, loadingMsg, utils 
    } = props;

    return (
        <div className="page-view">
            <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Icons.Shield /> Admin Panel</h2>
            </div>

            {adminTab === 'menu' && (
                <div className="grid grid-cols-2 gap-4 animate-pop pb-10">
                    <button onClick={() => setAdminTab('bookings')} className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Icons.FileCheck /></div>
                        <span className="font-bold text-slate-700 text-sm">จัดการงานตรวจ</span>
                    </button>
                    <button onClick={() => setAdminTab('users')} className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><Icons.User /></div>
                        <span className="font-bold text-slate-700 text-sm">จัดการสมาชิก</span>
                    </button>
                    <button onClick={() => setAdminTab('analytics')} className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><Icons.Chart /></div>
                        <span className="font-bold text-slate-700 text-sm">สถิติระบบ</span>
                    </button>
                    <button onClick={() => utils.exportToCSV(db.bookings)} className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><Icons.Download /></div>
                        <span className="font-bold text-slate-700 text-sm">ดาวน์โหลด (CSV)</span>
                    </button>
                    
                    <button onClick={() => setAdminTab('leaves')} className="p-5 bg-yellow-50 rounded-2xl shadow-sm border border-yellow-200 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center"><Icons.Clock /></div>
                        <span className="font-bold text-yellow-800 text-sm">ตั้งค่าวันลา</span>
                    </button>
                    
                    <button onClick={() => setAdminTab('events')} className="p-5 bg-green-50 rounded-2xl shadow-sm border border-green-200 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Icons.Star /></div>
                        <span className="font-bold text-green-800 text-sm">ตั้งค่ากิจกรรมบริษัท</span>
                    </button>

                    <button onClick={() => setAdminTab('holidays')} className="p-5 bg-red-50 rounded-2xl shadow-sm border border-red-200 flex flex-col items-center gap-3 col-span-2">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><Icons.CalendarX /></div>
                        <span className="font-bold text-red-800 text-sm">ตั้งค่าวันหยุดนักขัตฤกษ์</span>
                    </button>
                </div>
            )}

            {adminTab !== 'menu' && (
                <button onClick={() => setAdminTab('menu')} className="mb-4 text-xs font-bold text-slate-500 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                    <Icons.ChevronLeft /> กลับเมนูหลัก
                </button>
            )}

            {adminTab === 'analytics' && (
                <div className="space-y-4 animate-pop pb-10">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">🏆 สถิติจำนวนงานตรวจ</h3>
                        <div className="space-y-4">
                            {(db.inspectors || []).map(ins => {
                                const insBookings = db.bookings.filter(b => String(b.inspector_name) === String(ins.name) && String(b.inspector_name) !== 'SYSTEM_HOLIDAY' && String(b.status) !== 'cancelled' && !String(b.equipment_no).startsWith('LEAVE_') && !String(b.equipment_no).startsWith('EVENT_'));
                                const total = insBookings.length;
                                if(total === 0) return null; 
                                
                                const productCounts = insBookings.reduce((acc, curr) => {
                                    const pl = curr.product_line && curr.product_line !== '' ? curr.product_line : 'อื่นๆโปรดระบุ';
                                    acc[pl] = (acc[pl] || 0) + 1; return acc;
                                }, {});

                                return (
                                    <div key={ins.name}>
                                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                            <span>{ins.name}</span><span>{total} งาน</span>
                                        </div>
                                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                            {Object.entries(productCounts).map(([pl, count], idx) => {
                                                const colorClass = PRODUCT_COLORS[pl] || 'bg-slate-400';
                                                const percent = (count / total) * 100;
                                                return (
                                                    <div key={idx} title={`${pl}: ${count} งาน`} className={`h-full ${colorClass} flex items-center justify-center text-[8px] text-white font-bold`} style={{ width: `${percent}%` }}>
                                                        {percent > 10 ? count : ''}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-1.5">
                                            {Object.entries(productCounts).map(([pl, count], idx) => (
                                                <div key={idx} className="flex items-center gap-1 text-[9px] text-slate-500">
                                                    <div className={`w-2 h-2 rounded-full ${PRODUCT_COLORS[pl] || 'bg-slate-400'}`}></div>{pl} ({count})
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {adminTab === 'bookings' && (
                <div className="animate-pop pb-10">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => {
                            setModal({ type: 'booking', data: { isAdminOverride: true } }); 
                        }} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1">
                            <Icons.Plus /> สร้างคิวงานแทน
                        </button>
                        
                        {selectedDocs.length > 0 && (
                            <button onClick={() => {
                                setConfirmDialog({
                                    msg: `ยืนยันอนุมัติเอกสารทั้ง ${selectedDocs.length} รายการ?`,
                                    onConfirm: () => {
                                        setConfirmDialog(null);
                                        setLoadingMsg('กำลังอนุมัติเอกสารทั้งหมด...');
                                        Promise.all(selectedDocs.map(id => utils.fetchWithRetry(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'update_booking', id: id, user: user.username, layout_doc: 'true', wiring_doc: 'true', precheck_doc: 'true' }) }))).then(() => {
                                            setLoadingMsg(null); setSelectedDocs([]); fetchData(); showSlideToast('อนุมัติสำเร็จ', 'success');
                                        });
                                    }
                                });
                            }} className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">อนุมัติ {selectedDocs.length} รายการ</button>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap">
                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                    <tr><th className="p-3 text-center">เลือก</th><th className="p-3">วันที่จอง</th><th className="p-3">Eq No.</th><th className="p-3">โครงการ</th><th className="p-3">ผู้จอง</th><th className="p-3 text-center">เอกสาร</th></tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const adminTasks = (db.bookings || []).filter(b => String(b.inspector_name) !== 'SYSTEM_HOLIDAY' && String(b.inspector_name) !== 'SYSTEM_EVENT' && String(b.status) !== 'cancelled' && !String(b.equipment_no).startsWith('LEAVE_') && !String(b.equipment_no).startsWith('EVENT_')).sort((a, b) => new Date(b.date) - new Date(a.date));
                                        return (
                                            <>
                                                {adminTasks.slice(0, adminBookingsLimit).map((h, i) => {
                                                    const docsOk = String(h.layout_doc) === 'true' && String(h.wiring_doc) === 'true' && String(h.precheck_doc) === 'true';
                                                    return (
                                                        <tr key={i} className={`border-b border-slate-100 ${selectedDocs.includes(h.id) ? 'bg-red-50/50' : 'hover:bg-slate-50'}`}>
                                                            <td className="p-3 text-center">{!docsOk && <input type="checkbox" className="w-4 h-4 accent-red-600" checked={selectedDocs.includes(h.id)} onChange={() => { setSelectedDocs(prev => prev.includes(h.id) ? prev.filter(docId => docId !== h.id) : [...prev, h.id]); }} />}</td>
                                                            <td className="p-3 cursor-pointer" onClick={() => setModal({ type: 'detail', data: h })}>{h.date ? String(h.date).split('T')[0] : '-'}</td>
                                                            <td className="p-3 font-bold text-slate-800 cursor-pointer" onClick={() => setModal({ type: 'detail', data: h })}>{h.equipment_no}</td>
                                                            <td className="p-3 truncate max-w-[120px] cursor-pointer" onClick={() => setModal({ type: 'detail', data: h })}>{h.site_name}</td>
                                                            <td className="p-3 cursor-pointer">{h.created_by}</td>
                                                            <td className="p-3 text-center cursor-pointer" onClick={() => setModal({ type: 'detail', data: h })}>{docsOk ? <span className="text-green-600 font-bold">✅ ส่งแล้ว</span> : <span className="text-amber-500 font-bold">⏳ รอตรวจสอบ</span>}</td>
                                                        </tr>
                                                    );
                                                })}
                                                {adminBookingsLimit < adminTasks.length && (
                                                    <tr>
                                                        <td colSpan="6" className="p-4">
                                                            <button onClick={() => setAdminBookingsLimit(prev => prev + 20)} className="w-full py-2 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs">โหลดเพิ่มเติม... ({adminBookingsLimit} / {adminTasks.length})</button>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        )
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {adminTab === 'users' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pop pb-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                <tr><th className="p-3">Username / ชื่อ</th><th className="p-3">แผนก</th><th className="p-3">สิทธิ์</th><th className="p-3 text-center">สถานะ</th><th className="p-3 text-center">จัดการ</th></tr>
                            </thead>
                            <tbody>
                                {(db.users || []).map((u, i) => (
                                    <tr key={i} className="border-b border-slate-100">
                                        <td className="p-3 font-bold text-slate-800">{u.username}<br/><span className="text-[10px] text-slate-500 font-normal">{u.fullname || '-'}</span></td>
                                        <td className="p-3">{u.department || '-'}</td>
                                        <td className="p-3">{u.role === 'admin' ? 'ผู้ดูแล' : 'พนักงาน'}</td>
                                        <td className="p-3 text-center">
                                            {u.status === 'pending' ? <span className="text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded">รออนุมัติ</span> : 
                                             u.status === 'approved' ? <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">ใช้งานได้</span> : 
                                             <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">ระงับ</span>}
                                        </td>
                                        <td className="p-3 text-center flex justify-center gap-2">
                                            {u.status === 'pending' && <button onClick={() => setConfirmDialog({msg: `อนุมัติให้ ${u.username} ใช้งานระบบ?`, onConfirm: () => { setConfirmDialog(null); apiAction({action: 'update_user_status', admin_user: user.username, target_user: u.username, new_status: 'approved'}, 'กำลังอนุมัติ...'); }})} className="bg-green-500 text-white px-3 py-1 rounded-lg shadow-sm">อนุมัติ</button>}
                                            {u.status === 'approved' && <button onClick={() => setConfirmDialog({msg: `ระงับผู้ใช้ ${u.username} ไม่ให้เข้าสู่ระบบ?`, onConfirm: () => { setConfirmDialog(null); apiAction({action: 'update_user_status', admin_user: user.username, target_user: u.username, new_status: 'blocked'}, 'กำลังระงับบัญชี...'); }})} className="bg-red-500 text-white px-3 py-1 rounded-lg shadow-sm">บล็อก</button>}
                                            {u.status === 'blocked' && <button onClick={() => setConfirmDialog({msg: `ปลดบล็อกให้ ${u.username}?`, onConfirm: () => { setConfirmDialog(null); apiAction({action: 'update_user_status', admin_user: user.username, target_user: u.username, new_status: 'approved'}, 'กำลังปลดบล็อก...'); }})} className="bg-slate-500 text-white px-3 py-1 rounded-lg shadow-sm">ปลดบล็อก</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {adminTab === 'leaves' && (
                <div className="animate-pop space-y-4 pb-10">
                    <form onSubmit={async (e) => {
                        e.preventDefault(); 
                        if (leaveDates.length === 0) return setAlertMsg('ไม่มีวันลาที่สามารถตั้งค่าได้');
                        const fd = new FormData(e.target);
                        const sTime = fd.get('start_time'); const eTime = fd.get('end_time');
                        
                        let finalLeaveName = leaveType === 'อื่นๆโปรดระบุ' ? customLeaveType : leaveType;
                        if (leaveType === 'อื่นๆโปรดระบุ' && !customLeaveType.trim()) return setAlertMsg('กรุณาระบุประเภทการลา');
                        
                        if (sTime && eTime) finalLeaveName = `${sTime}-${eTime} ${finalLeaveName}`;

                        setConfirmDialog({
                            msg: `ยืนยันบันทึก ${finalLeaveName} ให้ ${leaveInspector} จำนวน ${leaveDates.length} วัน?`,
                            onConfirm: async () => {
                                setConfirmDialog(null);
                                const payload = { action: 'create_multiple_bookings', dates: leaveDates, inspector_name: leaveInspector, job_type: 'leave', site_name: finalLeaveName, equipment_no: `LEAVE_${Date.now()}`, user: user.username };
                                const ok = await apiAction(payload, 'กำลังบันทึกวันลา...');
                                if(ok) { showSlideToast('เพิ่มวันลาสำเร็จ', 'success'); setLeaveStartDate(''); setLeaveEndDate(''); setLeaveInspector(''); setCustomLeaveType(''); e.target.reset(); }
                            }
                        });
                    }} className="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-200">
                        <h3 className="font-bold text-yellow-800 mb-3 border-b border-yellow-200 pb-2">➕ ระบุวันลาของผู้ตรวจ</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-yellow-700">ผู้ตรวจ</label>
                                <select value={leaveInspector} onChange={e=>setLeaveInspector(e.target.value)} required className="bg-white p-2 rounded-lg border border-yellow-200 w-full text-sm font-bold outline-none">
                                    <option value="">-- เลือกผู้ตรวจ --</option>
                                    {(db.inspectors || []).map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs font-bold text-yellow-700">จากวันที่</label><input type="date" value={leaveStartDate} onChange={e=>setLeaveStartDate(e.target.value)} required className="bg-white p-2 rounded-lg border border-yellow-200 w-full text-sm outline-none" /></div>
                                <div><label className="text-xs font-bold text-yellow-700">ถึงวันที่</label><input type="date" value={leaveEndDate} onChange={e=>setLeaveEndDate(e.target.value)} required className="bg-white p-2 rounded-lg border border-yellow-200 w-full text-sm outline-none" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs font-bold text-yellow-700">เวลาเริ่ม (ไม่บังคับ)</label><input type="time" name="start_time" className="bg-white p-2 rounded-lg border border-yellow-200 w-full text-sm outline-none" /></div>
                                <div><label className="text-xs font-bold text-yellow-700">เวลาสิ้นสุด (ไม่บังคับ)</label><input type="time" name="end_time" className="bg-white p-2 rounded-lg border border-yellow-200 w-full text-sm outline-none" /></div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-yellow-700">ประเภทการลา</label>
                                <select value={leaveType} onChange={e=>setLeaveType(e.target.value)} className="bg-white p-2 rounded-lg border border-yellow-200 w-full text-sm font-bold outline-none">
                                    <option value="ลาพักร้อน">ลาพักร้อน</option><option value="ลาป่วย">ลาป่วย</option><option value="ลากิจ">ลากิจ</option><option value="อื่นๆโปรดระบุ">อื่นๆโปรดระบุ</option>
                                </select>
                                {leaveType === 'อื่นๆโปรดระบุ' && (<input type="text" value={customLeaveType} onChange={e => setCustomLeaveType(e.target.value)} placeholder="โปรดระบุสาเหตุการลา..." required className="mt-2 bg-white p-2 rounded-lg border border-yellow-300 w-full text-sm outline-none" />)}
                            </div>
                            {(leaveStartDate && leaveEndDate && leaveInspector) && (
                                <div className="p-3 bg-white border border-yellow-300 rounded-lg text-center shadow-sm">
                                    <div className="text-xs font-bold text-yellow-700 mb-1">จำนวนวันลาสุทธิ (ไม่รวมวันอาทิตย์/หยุด/กิจกรรม)</div>
                                    <div className="text-2xl font-black text-yellow-600">{leaveDates.length} <span className="text-sm font-bold">วัน</span></div>
                                </div>
                            )}
                            <button disabled={loadingMsg || leaveDates.length === 0} className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${leaveDates.length > 0 ? 'bg-yellow-600 text-white shadow-md' : 'bg-yellow-200 text-yellow-400'}`}>บันทึกวันลา</button>
                        </div>
                    </form>
                    
                    {/* 📍 รายการวันลาที่ให้กดลบได้ */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-yellow-200 mt-4">
                        <h3 className="font-bold text-yellow-800 mb-3 border-b border-yellow-100 pb-2">รายการวันลาที่ตั้งไว้</h3>
                        <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                            {(db.bookings || []).filter(b => b.job_type === 'leave' && String(b.status) !== 'cancelled').map((h, i) => (
                                <div key={i} className="flex justify-between items-center bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                                    <div>
                                        <div className="text-[10px] font-bold text-yellow-800">{h.date ? String(h.date).split('T')[0] : ''} | {h.inspector_name}</div>
                                        <div className="text-xs text-yellow-700">{h.site_name}</div>
                                    </div>
                                    <button onClick={() => { if(window.confirm('ต้องการลบการตั้งค่านี้?')) apiAction({action: 'delete_booking', id: h.id, user: user.username}, 'กำลังลบ...'); }} className="text-red-500 p-1.5 bg-white rounded shadow-sm"><Icons.X /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {adminTab === 'events' && (
                <div className="animate-pop space-y-4 pb-10">
                    <form onSubmit={async (e) => {
                        e.preventDefault(); const fd = new FormData(e.target);
                        if (eventDates.length === 0) return setAlertMsg('ไม่มีวันที่สามารถตั้งค่าได้');
                        
                        const target = fd.get('inspector'); const finalTarget = target === 'ALL' ? 'SYSTEM_EVENT' : target;
                        const sTime = fd.get('start_time'); const eTime = fd.get('end_time');
                        let eventName = fd.get('event_name');
                        
                        if (sTime && eTime) eventName = `${sTime}-${eTime} ${eventName}`;

                        setConfirmDialog({
                            msg: `ยืนยันบันทึกกิจกรรม ${eventName} จำนวน ${eventDates.length} วัน?`,
                            onConfirm: async () => {
                                setConfirmDialog(null);
                                const payload = { action: 'create_multiple_bookings', dates: eventDates, inspector_name: finalTarget, job_type: 'company_event', site_name: eventName, equipment_no: `EVENT_${Date.now()}`, user: user.username };
                                const ok = await apiAction(payload, 'กำลังบันทึกกิจกรรม...');
                                if(ok) { showSlideToast('เพิ่มกิจกรรมสำเร็จ', 'success'); setEventStartDate(''); setEventEndDate(''); e.target.reset(); }
                            }
                        });
                    }} className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-200">
                        <h3 className="font-bold text-green-800 mb-3 border-b border-green-200 pb-2">➕ ระบุกิจกรรมบริษัท</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs font-bold text-green-700">จากวันที่</label><input type="date" value={eventStartDate} onChange={e=>setEventStartDate(e.target.value)} required className="bg-white p-2 rounded-lg border border-green-200 w-full text-sm outline-none" /></div>
                                <div><label className="text-xs font-bold text-green-700">ถึงวันที่</label><input type="date" value={eventEndDate} onChange={e=>setEventEndDate(e.target.value)} required className="bg-white p-2 rounded-lg border border-green-200 w-full text-sm outline-none" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs font-bold text-green-700">เวลาเริ่ม (ไม่บังคับ)</label><input type="time" name="start_time" className="bg-white p-2 rounded-lg border border-green-200 w-full text-sm outline-none" /></div>
                                <div><label className="text-xs font-bold text-green-700">เวลาสิ้นสุด (ไม่บังคับ)</label><input type="time" name="end_time" className="bg-white p-2 rounded-lg border border-green-200 w-full text-sm outline-none" /></div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-green-700">ผู้เข้าร่วม</label>
                                <select name="inspector" required className="bg-white p-2 rounded-lg border border-green-200 w-full text-sm font-bold outline-none">
                                    <option value="ALL">✅ ผู้ตรวจทุกคน</option>
                                    {(db.inspectors || []).map(i => <option key={i.name} value={i.name}>👤 เฉพาะ: {i.name}</option>)}
                                </select>
                            </div>
                            <div><label className="text-xs font-bold text-green-700">ชื่อกิจกรรม</label><input type="text" name="event_name" required placeholder="เช่น อบรมความปลอดภัย" className="bg-white p-2 rounded-lg border border-green-200 w-full text-sm outline-none" /></div>
                            
                            {(eventStartDate && eventEndDate) && (
                                <div className="p-3 bg-white border border-green-300 rounded-lg text-center shadow-sm">
                                    <div className="text-xs font-bold text-green-700 mb-1">จำนวนวันจัดกิจกรรม (ไม่รวมวันอาทิตย์/หยุด)</div>
                                    <div className="text-2xl font-black text-green-600">{eventDates.length} <span className="text-sm font-bold">วัน</span></div>
                                </div>
                            )}
                            <button disabled={loadingMsg || eventDates.length === 0} className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${eventDates.length > 0 ? 'bg-green-600 text-white shadow-md' : 'bg-green-200 text-green-400'}`}>บันทึกกิจกรรม</button>
                        </div>
                    </form>
                    
                    {/* 📍 รายการกิจกรรมที่ให้กดลบได้ */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200 mt-4">
                        <h3 className="font-bold text-green-800 mb-3 border-b border-green-100 pb-2">รายการกิจกรรมที่ตั้งไว้</h3>
                        <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                            {(db.bookings || []).filter(b => b.job_type === 'company_event' && String(b.status) !== 'cancelled').map((h, i) => (
                                <div key={i} className="flex justify-between items-center bg-green-50 p-2 rounded-lg border border-green-100">
                                    <div>
                                        <div className="text-[10px] font-bold text-green-800">{h.date ? String(h.date).split('T')[0] : ''} | {h.inspector_name === 'SYSTEM_EVENT' ? 'ทุกคน' : h.inspector_name}</div>
                                        <div className="text-xs text-green-700">{h.site_name}</div>
                                    </div>
                                    <button onClick={() => { if(window.confirm('ต้องการลบการตั้งค่านี้?')) apiAction({action: 'delete_booking', id: h.id, user: user.username}, 'กำลังลบ...'); }} className="text-red-500 p-1.5 bg-white rounded shadow-sm"><Icons.X /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {adminTab === 'holidays' && (
                <div className="animate-pop space-y-4 pb-10">
                    <form onSubmit={async (e) => {
                        e.preventDefault(); const fd = new FormData(e.target);
                        if (holidayDates.length === 0) return setAlertMsg('ไม่มีวันที่สามารถตั้งค่าได้');
                        const hName = fd.get('h_name');
                        setConfirmDialog({
                            msg: `ยืนยันตั้งค่าวัดหยุด: ${hName} จำนวน ${holidayDates.length} วัน?`,
                            onConfirm: async () => {
                                setConfirmDialog(null);
                                const payload = { action: 'create_multiple_bookings', dates: holidayDates, inspector_name: 'SYSTEM_HOLIDAY', job_type: 'public_holiday', site_name: hName, equipment_no: `HLD_${Date.now()}`, user: user.username };
                                const ok = await apiAction(payload, 'กำลังเพิ่มวันหยุด...');
                                if(ok) { showSlideToast('เพิ่มวันหยุดสำเร็จ', 'success'); setHolidayStartDate(''); setHolidayEndDate(''); e.target.reset(); }
                            }
                        });
                    }} className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-200">
                        <h3 className="font-bold text-red-800 mb-3 border-b border-red-200 pb-2">➕ ระบุวันหยุดนักขัตฤกษ์</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs font-bold text-red-700">จากวันที่</label><input type="date" value={holidayStartDate} onChange={e=>setHolidayStartDate(e.target.value)} required className="bg-white p-2 rounded-lg border border-red-200 w-full text-sm outline-none" /></div>
                                <div><label className="text-xs font-bold text-red-700">ถึงวันที่</label><input type="date" value={holidayEndDate} onChange={e=>setHolidayEndDate(e.target.value)} required className="bg-white p-2 rounded-lg border border-red-200 w-full text-sm outline-none" /></div>
                            </div>
                            <div><label className="text-xs font-bold text-red-700">ชื่อวันหยุด</label><input type="text" name="h_name" required placeholder="เช่น วันสงกรานต์" className="bg-white p-2 rounded-lg border border-red-200 w-full text-sm outline-none" /></div>
                            {(holidayStartDate && holidayEndDate) && (
                                <div className="p-3 bg-white border border-red-300 rounded-lg text-center shadow-sm">
                                    <div className="text-xs font-bold text-red-700 mb-1">รวมวันหยุดทั้งหมด (ไม่นับวันอาทิตย์)</div>
                                    <div className="text-2xl font-black text-red-600">{holidayDates.length} <span className="text-sm font-bold">วัน</span></div>
                                </div>
                            )}
                            <button disabled={loadingMsg || holidayDates.length === 0} className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${holidayDates.length > 0 ? 'bg-red-600 text-white shadow-md' : 'bg-red-200 text-red-400'}`}>บันทึกวันหยุด</button>
                        </div>
                    </form>
                    
                    {/* 📍 รายการวันหยุดที่ให้กดลบได้ */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-red-200 mt-4">
                        <h3 className="font-bold text-red-800 mb-3 border-b border-red-100 pb-2">รายการวันหยุดที่ตั้งไว้</h3>
                        <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                            {(db.bookings || []).filter(b => b.job_type === 'public_holiday' && String(b.status) !== 'cancelled').map((h, i) => (
                                <div key={i} className="flex justify-between items-center bg-red-50 p-2 rounded-lg border border-red-100">
                                    <div>
                                        <div className="text-[10px] font-bold text-red-800">{h.date ? String(h.date).split('T')[0] : ''}</div>
                                        <div className="text-xs text-red-700">{h.site_name}</div>
                                    </div>
                                    <button onClick={() => { if(window.confirm('ต้องการลบวันหยุดนี้?')) apiAction({action: 'delete_booking', id: h.id, user: user.username}, 'กำลังลบ...'); }} className="text-red-500 p-1.5 bg-white rounded shadow-sm"><Icons.X /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
