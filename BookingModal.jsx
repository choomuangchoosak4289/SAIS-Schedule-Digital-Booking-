// BookingModal.jsx
const BookingModal = (props) => {
    // แตกตัวแปร (Props)
    const {
        modal, setModal, handleBookingSubmit, isAdmin, currentView, adminTab, db, user,
        productLineSelection, setProductLineSelection, areaSelection, setAreaSelection,
        jobTypeSelection, setJobTypeSelection, liveMapUrl, handleMapChange,
        uploadingDoc, handleImageUpload, loadingMsg, handleCancelBooking, utils
    } = props;

    return (
        <div className="backdrop z-[150]">
            <div className="modal-card">
                <button onClick={() => setModal(null)} className="btn-close-modern"><Icons.X /></button>
                <div className="p-6 overflow-y-auto">
                    <div className="mb-6 border-b pb-4 pr-10">
                        <h3 className="text-xl font-bold text-slate-900">{modal.type === 'booking' ? 'ฟอร์มบันทึกข้อมูล' : 'รายละเอียดงาน'}</h3>
                        <div className="text-xs text-red-600 font-bold uppercase mt-1">{modal.data?.inspector_name || 'กรุณาเลือกผู้ตรวจ'} • {modal.data?.date ? String(modal.data.date).split('T')[0] : 'กรุณาเลือกวันที่'}</div>
                    </div>
                    
                    {modal.type === 'booking' ? (
                        <form onSubmit={handleBookingSubmit} className="space-y-3">
                            <input type="hidden" id="layout_img_input" name="layout_img" defaultValue={modal.data?.layout_img || ''} />
                            <input type="hidden" id="wiring_img_input" name="wiring_img" defaultValue={modal.data?.wiring_img || ''} />
                            <input type="hidden" id="precheck_img_input" name="precheck_img" defaultValue={modal.data?.precheck_img || ''} />
                            
                            {isAdmin && modal.data?.isAdminOverride && (
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl mb-2 space-y-2">
                                    <div className="text-xs font-bold text-orange-800">👑 [Admin] สร้างงานแทนพนักงาน</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select name="admin_inspector_target" required className="text-xs p-2 rounded border outline-none font-bold text-slate-700">
                                            <option value="">-- เลือกผู้ตรวจ --</option>
                                            {(db.inspectors || []).map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                                        </select>
                                        <input type="date" name="admin_date_target" required className="text-xs p-2 rounded border outline-none font-bold text-slate-700" />
                                    </div>
                                </div>
                            )}

                            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-2">
                                <label className="text-xs font-bold text-indigo-800 mb-1 block">Product Line</label>
                                <select value={productLineSelection} onChange={(e) => setProductLineSelection(e.target.value)} className="w-full bg-white border border-indigo-200 p-2 rounded-lg text-sm font-bold text-slate-700 outline-none">
                                    <option value="ES1,3300">ES1,3300</option>
                                    <option value="5500">5500</option>
                                    <option value="ES5/ES5.1">ES5/ES5.1</option>
                                    <option value="S-villas">S-villas</option>
                                    <option value="ES2">ES2</option>
                                    <option value="ES3">ES3</option>
                                    <option value="MOR-R">MOR-R</option>
                                    <option value="S7R4">S7R4</option>
                                    <option value="7000">7000</option>
                                    <option value="อื่นๆโปรดระบุ">อื่นๆโปรดระบุ</option>
                                </select>
                                {productLineSelection === 'อื่นๆโปรดระบุ' && (
                                    <input name="custom_product_line" required placeholder="ระบุ Product Line..." className="mt-2 w-full p-2 border border-indigo-200 rounded-lg text-sm" />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs font-bold text-slate-500">พื้นที่ตรวจ (Area)</label><select value={areaSelection} onChange={(e) => setAreaSelection(e.target.value)} className="bg-slate-50"><option value="กรุงเทพและปริมณฑล">กทม.</option><option value="เชียงใหม่">เชียงใหม่</option><option value="ภูเก็ต">ภูเก็ต</option><option value="other">อื่นๆ</option></select></div>
                                <div><label className="text-xs font-bold text-slate-500">ประเภทงาน</label><select value={jobTypeSelection} onChange={(e) => setJobTypeSelection(e.target.value)} className="bg-slate-50"><option value="New">New</option><option value="MOD">MOD</option></select></div>
                            </div>
                            {areaSelection === 'other' && <div><input name="custom_area" required placeholder="ระบุจังหวัด..." className="bg-slate-50" /></div>}
                            <div><label className="text-xs font-bold text-slate-500">Project Name</label><input name="site_name" defaultValue={modal.data?.site_name || ''} required placeholder="ชื่อโครงการ" /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs font-bold text-slate-500">Eq No.</label><input name="equipment_no" defaultValue={modal.data?.equipment_no || ''} required placeholder="XXXX" /></div>
                                <div><label className="text-xs font-bold text-slate-500">Unit</label><input name="unit_no" defaultValue={modal.data?.unit_no || ''} required placeholder="A1" /></div>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500">Google map (ใส่ลิงก์หรือพิกัด)</label>
                                <input name="map_link" defaultValue={modal.data?.map_link || ''} placeholder="ใส่ลิงก์แผนที่ Google Maps" onChange={(e) => { if (window.mapTimeout) clearTimeout(window.mapTimeout); window.mapTimeout = setTimeout(() => handleMapChange(e.target.value), 800); }} className="bg-slate-50" />
                                {(liveMapUrl) && (
                                    <div className="map-preview relative mt-2 bg-slate-100 rounded-xl overflow-hidden border"><iframe width="100%" height="100%" frameBorder="0" src={liveMapUrl} loading="lazy"></iframe></div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs font-bold text-slate-500">Foreman</label><input name="foreman" defaultValue={modal.data?.foreman || ''} required /></div>
                                <div><label className="text-xs font-bold text-slate-500">Tel</label><input name="tel" defaultValue={modal.data?.tel ? String(modal.data.tel).padStart(10, '0') : ''} type="tel" pattern="\d{10}" maxLength="10" required /></div>
                            </div>
                            <div><label className="text-xs font-bold text-slate-500">หมายเหตุ</label><textarea name="notes" defaultValue={modal.data?.notes || ''} rows="2" className="bg-slate-50 resize-none"></textarea></div>

                            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl space-y-3">
                                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1"><Icons.Upload /> อัปโหลดรูปเอกสารประกอบ</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="bg-white p-2 rounded border">
                                        <label className="text-[10px] font-bold text-slate-600 block mb-1">1. Layout Drawing</label>
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'layout')} className="text-[10px] w-full" />
                                        {uploadingDoc.layout && <span className="text-[10px] text-blue-600 font-bold animate-pulse mt-1 block">กำลังอัปโหลด...</span>}
                                        {document.getElementById('layout_img_input')?.value && <span className="text-[10px] text-green-600 font-bold mt-1 block">✅ อัปโหลดสำเร็จ</span>}
                                    </div>
                                    <div className="bg-white p-2 rounded border">
                                        <label className="text-[10px] font-bold text-slate-600 block mb-1">2. Wiring Diagram</label>
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'wiring')} className="text-[10px] w-full" />
                                        {uploadingDoc.wiring && <span className="text-[10px] text-blue-600 font-bold animate-pulse mt-1 block">กำลังอัปโหลด...</span>}
                                        {document.getElementById('wiring_img_input')?.value && <span className="text-[10px] text-green-600 font-bold mt-1 block">✅ อัปโหลดสำเร็จ</span>}
                                    </div>
                                    <div className="bg-white p-2 rounded border">
                                        <label className="text-[10px] font-bold text-slate-600 block mb-1">3. Pre-check</label>
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'precheck')} className="text-[10px] w-full" />
                                        {uploadingDoc.precheck && <span className="text-[10px] text-blue-600 font-bold animate-pulse mt-1 block">กำลังอัปโหลด...</span>}
                                        {document.getElementById('precheck_img_input')?.value && <span className="text-[10px] text-green-600 font-bold mt-1 block">✅ อัปโหลดสำเร็จ</span>}
                                    </div>
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl mt-2">
                                    <div className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1"><Icons.FileCheck /> ADMIN CHECKLIST</div>
                                    <div className="flex flex-col gap-2">
                                        <label className="admin-check-item"><input type="checkbox" name="layout_doc" defaultChecked={String(modal.data?.layout_doc) === 'true'} /> Layout Drawings</label>
                                        <label className="admin-check-item"><input type="checkbox" name="wiring_doc" defaultChecked={String(modal.data?.wiring_doc) === 'true'} /> Wiring Diagram</label>
                                        <label className="admin-check-item"><input type="checkbox" name="precheck_doc" defaultChecked={String(modal.data?.precheck_doc) === 'true'} /> Pre-check</label>
                                    </div>
                                </div>
                            )}
                            <button disabled={loadingMsg || uploadingDoc.layout || uploadingDoc.wiring || uploadingDoc.precheck} className={`w-full py-3 mt-4 rounded-xl font-bold text-sm shadow-md transition-all ${(loadingMsg || uploadingDoc.layout || uploadingDoc.wiring || uploadingDoc.precheck) ? 'bg-slate-400' : 'bg-red-600 text-white'}`}>{(loadingMsg || uploadingDoc.layout || uploadingDoc.wiring || uploadingDoc.precheck) ? 'รอสักครู่...' : 'บันทึกข้อมูล'}</button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900">{modal.data?.site_name || '-'}</h2>
                            
                            {modal.data?.product_line && (
                                <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg border border-indigo-200">
                                    Product: {modal.data.product_line}
                                </div>
                            )}

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-y-4 text-sm mt-2">
                                <div><span className="text-xs text-slate-400 block font-bold">Eq No.</span><b>{modal.data?.equipment_no || '-'}</b></div>
                                <div><span className="text-xs text-slate-400 block font-bold">Unit</span><b>{modal.data?.unit_no || '-'}</b></div>
                                <div><span className="text-xs text-slate-400 block font-bold">Foreman</span><b>{modal.data?.foreman || '-'}</b></div>
                                <div><span className="text-xs text-slate-400 block font-bold">Tel</span>{modal.data?.tel ? <a href={`tel:${String(modal.data.tel).padStart(10, '0')}`} className="text-blue-600 font-bold">{String(modal.data.tel).padStart(10, '0')}</a> : <b>-</b>}</div>
                                {modal.data?.notes && <div className="col-span-2 mt-2 pt-3 border-t border-slate-200"><span className="text-xs text-slate-400 block font-bold flex items-center gap-1"><Icons.MessageSquare /> หมายเหตุ</span><p className="text-slate-700 mt-1 whitespace-pre-wrap text-sm leading-relaxed">{modal.data.notes}</p></div>}
                            </div>
                            
                            {(modal.data?.layout_img || modal.data?.wiring_img || modal.data?.precheck_img) && (
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    {modal.data.layout_img && <a href={modal.data.layout_img} target="_blank" className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 font-bold text-[10px] text-center shadow-sm">🖼️ ดู Layout</a>}
                                    {modal.data.wiring_img && <a href={modal.data.wiring_img} target="_blank" className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 font-bold text-[10px] text-center shadow-sm">🖼️ ดู Wiring</a>}
                                    {modal.data.precheck_img && <a href={modal.data.precheck_img} target="_blank" className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 font-bold text-[10px] text-center shadow-sm">🖼️ ดู Pre-check</a>}
                                </div>
                            )}

                            {modal.data?.map_link && utils.getMapEmbedUrl && utils.getMapEmbedUrl(modal.data.map_link) && <div><span className="text-xs font-bold text-slate-500 uppercase">Location</span><div className="map-preview relative mt-1 bg-slate-100 rounded-xl overflow-hidden border"><iframe width="100%" height="100%" frameBorder="0" src={utils.getMapEmbedUrl(modal.data.map_link)} loading="lazy"></iframe></div></div>}

                            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="text-xs font-bold text-slate-500 mb-2">ADMIN CHECKLIST</div>
                                <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-center">
                                    <div className={`p-2 rounded border ${String(modal.data?.layout_doc) === 'true' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>Layout<br/>{String(modal.data?.layout_doc) === 'true' ? '✅ ส่งแล้ว' : '❌ ยังไม่ส่ง'}</div>
                                    <div className={`p-2 rounded border ${String(modal.data?.wiring_doc) === 'true' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>Wiring<br/>{String(modal.data?.wiring_doc) === 'true' ? '✅ ส่งแล้ว' : '❌ ยังไม่ส่ง'}</div>
                                    <div className={`p-2 rounded border ${String(modal.data?.precheck_doc) === 'true' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>Pre-check<br/>{String(modal.data?.precheck_doc) === 'true' ? '✅ ส่งแล้ว' : '❌ ยังไม่ส่ง'}</div>
                                </div>
                            </div>

                            {(isAdmin || user?.username === modal.data?.created_by) && (
                                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                    <button onClick={() => { 
                                        setAreaSelection(modal.data?.area || 'กรุงเทพและปริมณฑล'); 
                                        setJobTypeSelection(modal.data?.job_type || 'New'); 
                                        setProductLineSelection(modal.data?.product_line || 'ES1,3300');
                                        setModal({ type: 'booking', data: modal.data }); 
                                    }} className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm bg-slate-50">✏️ แก้ไขงาน</button>
                                    
                                    <button onClick={() => handleCancelBooking(modal.data)} className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 font-bold text-sm bg-red-50">🗑️ ยกเลิกงาน</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
