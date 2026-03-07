const LoginModal = (props) => {
    // แตกตัวแปร (Destructuring Props) ให้พร้อมใช้งาน
    const { 
        isRegisterMode, setIsRegisterMode, 
        showPassword, setShowPassword, 
        setShowLogin, setAlertMsg, 
        apiAction, showSlideToast, 
        setLoadingMsg, setUser, 
        SCRIPT_URL, loadingMsg 
    } = props;

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        const fd = new FormData(e.target);
        
        if (isRegisterMode) {
            if(fd.get('password') !== fd.get('confirm_password')) return setAlertMsg('รหัสผ่านไม่ตรงกัน');
            const payload = { 
                action: 'register', username: fd.get('username'), password: fd.get('password'),
                fullname: fd.get('fullname'), department: fd.get('department'), position: fd.get('position'), email: fd.get('email'), phone: fd.get('phone')
            };
            const res = await apiAction(payload, 'กำลังส่งข้อมูลสมัครสมาชิก...');
            if (res) { showSlideToast('สมัครสำเร็จ รอแอดมินอนุมัติ', 'success'); setIsRegisterMode(false); }
        } else {
            setLoadingMsg('กำลังตรวจสอบข้อมูล...');
            try {
                const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'login', username: fd.get('username'), password: fd.get('password') }) });
                const result = await res.json(); 
                setLoadingMsg(null);
                if (result.status === 'ok') { 
                    setUser(result.user); setShowLogin(false); showSlideToast('เข้าสู่ระบบสำเร็จ', 'success'); 
                } else { setAlertMsg(result.message); }
            } catch (err) { setLoadingMsg(null); setAlertMsg('การเชื่อมต่อขัดข้อง'); }
        }
    };

    return (
        <div className="backdrop z-[250]">
            <div className="modal-card p-6">
                <button onClick={() => { setShowLogin(false); setIsRegisterMode(false); }} className="btn-close-modern"><Icons.X /></button>
                <h2 className="text-2xl font-bold text-slate-800 text-center mb-6 mt-2">{isRegisterMode ? 'สมัครสมาชิกใหม่' : 'เข้าสู่ระบบ'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    
                    {isRegisterMode && (
                        <div className="space-y-3 pb-2 border-b border-slate-100">
                            <div><label className="text-[10px] font-bold text-slate-500">ชื่อ-นามสกุล</label><input name="fullname" required placeholder="ระบุชื่อ-นามสกุล" className="bg-slate-50 w-full" /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-[10px] font-bold text-slate-500">แผนก</label><input name="department" required placeholder="เช่น NI , MOD" className="bg-slate-50 w-full" /></div>
                                <div><label className="text-[10px] font-bold text-slate-500">ตำแหน่ง</label><input name="position" required placeholder="เช่น PE,PM,Foreman" className="bg-slate-50 w-full" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-[10px] font-bold text-slate-500">อีเมล</label><input type="email" name="email" required placeholder="@schindler.com" className="bg-slate-50 w-full" /></div>
                                <div><label className="text-[10px] font-bold text-slate-500">เบอร์โทรศัพท์</label><input type="tel" name="phone" required placeholder="08XXXXXXXX" className="bg-slate-50 w-full" /></div>
                            </div>
                        </div>
                    )}
                    
                    <div><label className="text-[10px] font-bold text-slate-500">Username (ใช้ล็อกอิน)</label><input name="username" required placeholder="Username" className="bg-slate-50 w-full" /></div>
                    
                    <div className="relative">
                        <label className="text-[10px] font-bold text-slate-500">Password</label>
                        <input name="password" type={showPassword ? "text" : "password"} required placeholder="Password" className="bg-slate-50 pr-12 w-full" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[32px] text-slate-400">{showPassword ? <Icons.EyeOff /> : <Icons.Eye />}</button>
                    </div>
                    
                    {isRegisterMode && (
                        <div><label className="text-[10px] font-bold text-slate-500">ยืนยัน Password</label><input name="confirm_password" type={showPassword ? "text" : "password"} required placeholder="Confirm Password" className="bg-slate-50 w-full" /></div>
                    )}

                    <button disabled={loadingMsg} className="w-full py-3.5 rounded-xl text-white font-bold bg-red-600 mt-4">{loadingMsg ? 'รอสักครู่...' : (isRegisterMode ? 'ส่งข้อมูลสมัครสมาชิก' : 'LOGIN')}</button>
                    <div className="text-center mt-4"><button type="button" onClick={() => setIsRegisterMode(!isRegisterMode)} className="text-sm font-bold text-slate-500 underline">{isRegisterMode ? 'มีบัญชีอยู่แล้ว? กลับไปหน้าเข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่'}</button></div>
                </form>
            </div>
        </div>
    );
};
