
import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Map, Heart, GraduationCap, 
  Settings, LogOut, TrendingUp, DollarSign, Activity, 
  Search, MoreVertical, Filter, Plus, ChevronLeft, ChevronRight,
  Edit3, Save, X, Image as ImageIcon, Upload, Shield, Lock, CheckCircle2, AlertCircle, Home, Trash2, Palette, Type, Percent, Wallet, Calculator, FileText, Lightbulb, Sparkles, Loader2, Send, Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { networkingList, matchingList, crewList, lectureList } from '../constants';
import { AnyItem, User, Slide, CrewItem, NetworkingItem, LectureItem, MatchingItem, BriefingItem, CategoryHeaderInfo } from '../types';
import Badge from '../components/Badge';
import { GoogleGenAI } from "@google/genai";

// --- Mock Data for Users ---
const initialUsers: User[] = [
    { id: 1, name: '김관리', email: 'admin@imfoot.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', roles: ['super_admin'], joinDate: '2023-01-01' },
    { id: 2, name: '이임장', email: 'crew@imfoot.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', roles: ['crew_manager'], joinDate: '2023-03-15' },
    { id: 3, name: '박네트', email: 'net@imfoot.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', roles: ['networking_manager'], joinDate: '2023-05-20' },
    { id: 4, name: '최사랑', email: 'love@imfoot.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Caitlyn', roles: [], joinDate: '2023-06-10' },
    { id: 5, name: '강선생', email: 'teacher@imfoot.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', roles: ['lecture_manager'], joinDate: '2023-08-05' },
];

const ImageUploadField = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
    const [dimensions, setDimensions] = useState<{w: number, h: number} | null>(null);
    React.useEffect(() => {
        if(value) {
            const img = new Image();
            img.src = value;
            img.onload = () => { setDimensions({ w: img.naturalWidth, h: img.naturalHeight }); };
        }
    }, [value]);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { const result = reader.result as string; onChange(result); };
            reader.readAsDataURL(file);
        }
    };
    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-full sm:w-40 h-32 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative group flex items-center justify-center">
                    {value ? ( <> <img src={value} alt="Preview" className="w-full h-full object-cover" /> <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-1 text-center font-mono"> {dimensions ? `${dimensions.w} x ${dimensions.h}` : 'Loading...'} </div> </> ) : ( <ImageIcon className="text-slate-300" size={32} /> )}
                </div>
                <div className="flex-1 space-y-3 w-full">
                    <div className="relative"><input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" /></div>
                    <div><input type="text" value={value} readOnly className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-400 focus:outline-none" placeholder="이미지 URL (파일 업로드 시 자동 생성)" /></div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-black text-slate-900">{value}</h3>
      <p className={`text-xs font-bold mt-2 ${change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{change} <span className="text-slate-400 font-normal">vs last month</span></p>
    </div>
    <div className={`p-3 rounded-xl ${color}`}><Icon size={24} className="text-white" /></div>
  </div>
);

const AdminSidebar = ({ activeTab, setActiveTab, isOpen, onClose }: any) => {
  const navigate = useNavigate();
  const menu = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'permissions', label: '권한 관리', icon: Shield },
    { id: 'settlement', label: '정산 관리', icon: Wallet },
    { id: 'home_settings', label: '배너/디자인 관리', icon: Palette },
    { id: 'briefing', label: '오늘의 인사이트 (AI)', icon: Lightbulb },
    { type: 'divider' },
    { id: 'crew', label: '임장 크루 관리', icon: Map },
    { id: 'networking', label: '네트워킹 관리', icon: Users },
    { id: 'minddate', label: '마인드데이트', icon: Heart },
    { id: 'lecture', label: '강의/VOD 관리', icon: GraduationCap },
  ];

  return (
    <>
        {/* Mobile Backdrop */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={onClose}
            ></div>
        )}
        
        {/* Sidebar */}
        <aside className={`w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-extrabold text-sm">A</div>
                    <span className="font-bold text-xl">임풋 Admin</span>
                </div>
                {/* Mobile Close Button */}
                <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
                {menu.map((item: any, idx) => ( item.type === 'divider' ? ( <div key={idx} className="h-px bg-slate-800 my-4 mx-2"></div> ) : ( <button key={item.id} onClick={() => { setActiveTab(item.id); onClose(); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${ activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800' }`} > <item.icon size={18} /> {item.label} </button> ) ))}
            </nav>
            <div className="p-4 border-t border-slate-800"><button onClick={() => navigate('/')} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"> <LogOut size={18} /> 앱으로 돌아가기 </button></div>
        </aside>
    </>
  );
};

const PermissionModal = ({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (updatedUser: User) => void }) => {
    const [roles, setRoles] = useState<string[]>(user.roles);
    const toggleRole = (role: string) => { setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]); };
    const roleOptions = [
        { id: 'super_admin', label: '슈퍼 관리자 (전체 접근)', desc: '모든 메뉴와 설정에 접근할 수 있습니다.', color: 'bg-slate-900 border-slate-900' },
        { id: 'crew_manager', label: '임장 크루 매니저', desc: '임장 크루 콘텐츠 생성, 수정, 삭제 가능', color: 'bg-emerald-600 border-emerald-600' },
        { id: 'networking_manager', label: '네트워킹 매니저', desc: '스터디/네트워킹 콘텐츠 관리 가능', color: 'bg-amber-500 border-amber-500' },
        { id: 'minddate_manager', label: '마인드데이트 매니저', desc: '매칭 데이터 및 소개팅 콘텐츠 관리 가능', color: 'bg-pink-500 border-pink-500' },
        { id: 'lecture_manager', label: '강의/VOD 매니저', desc: '강의 업로드 및 수강생 관리 가능', color: 'bg-indigo-600 border-indigo-600' },
    ];
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50"><div className="flex items-center gap-3"> <img src={user.avatar} className="w-10 h-10 rounded-full bg-white border border-slate-200" alt="avatar"/> <div> <h2 className="text-lg font-bold text-slate-900">{user.name}님의 권한 설정</h2> <p className="text-xs text-slate-500">{user.email}</p> </div></div><button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"> <X size={20} /> </button></div>
                <div className="p-6 space-y-4">
                    {roleOptions.map((option) => { const isSelected = roles.includes(option.id); return ( <div key={option.id} onClick={() => toggleRole(option.id)} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}> <div className={`w-5 h-5 rounded flex items-center justify-center border mt-0.5 ${isSelected ? option.color + ' text-white border-transparent' : 'border-slate-300 bg-white'}`}> {isSelected && <CheckCircle2 size={14} />} </div> <div> <h4 className={`font-bold text-sm mb-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{option.label}</h4> <p className="text-xs text-slate-400">{option.desc}</p> </div> </div> ); })}
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50"><button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100">취소</button><button onClick={() => onSave({ ...user, roles })} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200">권한 저장</button></div>
            </div>
        </div>
    );
};

const UserTable = ({ users, onEdit }: { users: User[], onEdit: (user: User) => void }) => {
    const getRoleBadge = (role: string) => { switch(role) { case 'super_admin': return <Badge variant="default" className="bg-slate-800 text-white border border-slate-600">Super Admin</Badge>; case 'crew_manager': return <Badge variant="success">임장 크루</Badge>; case 'networking_manager': return <Badge variant="warning">네트워킹</Badge>; case 'minddate_manager': return <Badge variant="pink">마인드데이트</Badge>; case 'lecture_manager': return <Badge variant="purple">강의/VOD</Badge>; default: return null; } };
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between"><h3 className="font-bold text-lg text-slate-800">관리자 권한 관리 <span className="text-slate-400 text-sm font-normal">({users.length})</span></h3></div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><th className="p-4 font-semibold border-b border-slate-100 w-16">ID</th><th className="p-4 font-semibold border-b border-slate-100">회원 정보</th><th className="p-4 font-semibold border-b border-slate-100">보유 권한 (Roles)</th><th className="p-4 font-semibold border-b border-slate-100">가입일</th><th className="p-4 font-semibold border-b border-slate-100 text-right">관리</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => ( <tr key={user.id} className="hover:bg-slate-50 transition-colors"><td className="p-4 text-slate-400 text-sm font-mono">#{user.id}</td><td className="p-4"><div className="flex items-center gap-3"><img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" alt="" /><div><p className="font-bold text-slate-900 text-sm">{user.name}</p><p className="text-xs text-slate-400">{user.email}</p></div></div></td><td className="p-4"><div className="flex flex-wrap gap-2">{user.roles.length > 0 ? (user.roles.map(role => <span key={role}>{getRoleBadge(role)}</span>)) : (<span className="text-xs text-slate-400 px-2 py-1 rounded bg-slate-100">일반 회원</span>)}</div></td><td className="p-4 text-xs text-slate-500">{user.joinDate}</td><td className="p-4 text-right"><button onClick={() => onEdit(user)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 flex items-center gap-1 ml-auto"><Lock size={12} /> 권한 설정</button></td></tr> ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const EditModal = ({ item, onClose, onSave }: { item: AnyItem, onClose: () => void, onSave: (item: AnyItem) => void }) => {
    const [formData, setFormData] = useState<AnyItem>({ ...item });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10"><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Edit3 size={20} className="text-indigo-600" /> 콘텐츠 수정</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button></div>
                <div className="p-6 space-y-6">
                    <ImageUploadField label="대표 이미지 관리" value={formData.img} onChange={(val) => setFormData(prev => ({...prev, img: val}))} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2"><label className="block text-sm font-bold text-slate-700 mb-1">제목</label><input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold" /></div>
                        <div className="col-span-2"><label className="block text-sm font-bold text-slate-700 mb-1">설명 (요약)</label><textarea name="desc" value={formData.desc} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" /></div>
                        <div><label className="block text-sm font-bold text-slate-700 mb-1">작성자</label><input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                        <div><label className="block text-sm font-bold text-slate-700 mb-1">가격</label><input type="text" name="price" value={formData.price || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                        <div><label className="block text-sm font-bold text-slate-700 mb-1">상태</label><select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"><option value="open">모집중 (Open)</option><option value="closed">마감 (Closed)</option><option value="ended">종료 (Ended)</option></select></div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3"><button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors">취소</button><button onClick={() => onSave(formData)} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"><Save size={18} /> 저장하기</button></div>
            </div>
        </div>
    );
};

const DataTable = ({ title, data, onEdit }: { title: string, data: AnyItem[], onEdit: (item: AnyItem) => void }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between"><h3 className="font-bold text-lg text-slate-800">{title} 목록 <span className="text-slate-400 text-sm font-normal">({data.length})</span></h3><div className="flex gap-2"><button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors"><Plus size={16} /> 신규 등록</button></div></div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"><th className="p-4 font-semibold border-b border-slate-100 w-16">ID</th><th className="p-4 font-semibold border-b border-slate-100">이미지</th><th className="p-4 font-semibold border-b border-slate-100">제목/내용</th><th className="p-4 font-semibold border-b border-slate-100">작성자</th><th className="p-4 font-semibold border-b border-slate-100">상태</th><th className="p-4 font-semibold border-b border-slate-100">가격</th><th className="p-4 font-semibold border-b border-slate-100 text-right">관리</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                    {data.map((item) => ( <tr key={item.id} className="hover:bg-slate-50 transition-colors group"><td className="p-4 text-slate-400 text-sm font-mono">#{item.id}</td><td className="p-4"><img src={item.img} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-200" /></td><td className="p-4 max-w-xs"><p className="font-bold text-slate-800 text-sm line-clamp-1 mb-0.5">{item.title}</p><p className="text-slate-500 text-xs line-clamp-1">{item.desc}</p></td><td className="p-4"><span className="text-sm text-slate-700 font-medium">{item.author}</span></td><td className="p-4"><Badge variant={item.status === 'open' ? 'success' : item.status === 'closed' ? 'danger' : 'default'}>{item.status === 'open' ? '진행중' : item.status === 'closed' ? '마감' : '종료'}</Badge></td><td className="p-4 text-sm font-bold text-slate-700">{item.price || '무료'}</td><td className="p-4 text-right"><button onClick={() => onEdit(item)} className="text-slate-400 hover:text-indigo-600 p-2 rounded hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100"><Edit3 size={16} /></button></td></tr> ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

const NotificationManager = ({ notifications, setNotifications }: { notifications: string[], setNotifications: React.Dispatch<React.SetStateAction<string[]>> }) => {
    const [newNoti, setNewNoti] = useState("");
    const addNoti = () => { if (newNoti.trim()) { setNotifications(prev => [...prev, newNoti]); setNewNoti(""); } };
    const removeNoti = (index: number) => { setNotifications(prev => prev.filter((_, i) => i !== index)); };
    const updateNoti = (index: number, val: string) => { setNotifications(prev => prev.map((item, i) => i === index ? val : item)); };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-pink-500" /> 상단 알림 (Ticker) 관리</h3>
            <div className="space-y-3 mb-4">{notifications.map((noti, idx) => ( <div key={idx} className="flex gap-2"> <input type="text" value={noti} onChange={(e) => updateNoti(idx, e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /> <button onClick={() => removeNoti(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button> </div> ))}</div>
            <div className="flex gap-2"><input type="text" value={newNoti} onChange={(e) => setNewNoti(e.target.value)} placeholder="새로운 알림 문구를 입력하세요" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50" onKeyDown={(e) => e.key === 'Enter' && addNoti()} /><button onClick={addNoti} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700">추가</button></div>
        </div>
    );
};
const BannerManager = ({ slides, setSlides }: { slides: Slide[], setSlides: React.Dispatch<React.SetStateAction<Slide[]>> }) => {
    const updateSlide = (index: number, field: keyof Slide, value: string) => { setSlides(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s)); };
    const removeSlide = (index: number) => { if(window.confirm('정말 삭제하시겠습니까?')) { setSlides(prev => prev.filter((_, i) => i !== index)); } };
    const addSlide = () => { setSlides(prev => [...prev, { title: "새로운 배너 타이틀", desc: "배너 설명을 입력하세요", img: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1600" }]); };
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><ImageIcon size={20} className="text-blue-500" /> 메인 홈 슬라이드 배너</h3>
            <div className="space-y-8">{slides.map((slide, idx) => ( <div key={idx} className="flex gap-6 items-start pb-8 border-b border-slate-100 last:border-0 last:pb-0"> <div className="flex-1 space-y-3"> <ImageUploadField label={`슬라이드 ${idx + 1} 이미지`} value={slide.img} onChange={(val) => updateSlide(idx, 'img', val)} /> <div className="mt-4"><label className="text-xs font-bold text-slate-500 mb-1 block">타이틀</label><input type="text" value={slide.title} onChange={(e) => updateSlide(idx, 'title', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold" /></div><div><label className="text-xs font-bold text-slate-500 mb-1 block">설명</label><input type="text" value={slide.desc} onChange={(e) => updateSlide(idx, 'desc', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div></div><button onClick={() => removeSlide(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg hover:text-red-600 self-center"><Trash2 size={20} /></button></div> ))}</div>
            <button onClick={addSlide} className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:bg-slate-50 hover:border-slate-300 hover:text-slate-600 transition-all flex items-center justify-center gap-2"><Plus size={20} /> 배너 추가하기</button>
        </div>
    );
};

const CategoryHeaderManager = ({ headers, setHeaders }: { headers: {[key: string]: CategoryHeaderInfo}, setHeaders: React.Dispatch<React.SetStateAction<{[key: string]: CategoryHeaderInfo}>> }) => {
    const updateHeader = (key: string, field: keyof CategoryHeaderInfo, val: string) => { 
        setHeaders(prev => ({ 
            ...prev, 
            [key]: { ...prev[key], [field]: val } 
        })); 
    };
    
    const categories = [ 
        { key: 'networking', label: '스터디 & 네트워킹' }, 
        { key: 'minddate', label: '마인드데이트' }, 
        { key: 'crew', label: '임장 크루' }, 
        { key: 'lecture', label: '재테크 강의' } 
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Type size={20} className="text-purple-500" /> 카테고리별 상단 텍스트 (제목/설명)</h3>
            <p className="text-sm text-slate-500 mb-6">각 카테고리 페이지 상단에 노출되는 제목과 설명을 관리합니다.</p>
            <div className="space-y-6">
                {categories.map((cat) => ( 
                    <div key={cat.key} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50"> 
                        <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span> {cat.label}
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">제목 (Title)</label>
                                <input 
                                    type="text" 
                                    value={headers[cat.key].title} 
                                    onChange={(e) => updateHeader(cat.key, 'title', e.target.value)} 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">설명 (Description)</label>
                                <input 
                                    type="text" 
                                    value={headers[cat.key].description} 
                                    onChange={(e) => updateHeader(cat.key, 'description', e.target.value)} 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div> 
                ))}
            </div>
        </div>
    );
};

const MyPageBannerManager = ({ banner, setBanner }: { banner: string, setBanner: (val: string) => void }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><ImageIcon size={20} className="text-pink-500" /> 마이페이지 배너 이미지</h3>
            <p className="text-sm text-slate-500 mb-4">마이페이지 상단에 노출되는 배경 이미지입니다.</p>
            <ImageUploadField label="배너 이미지 URL" value={banner} onChange={setBanner} />
        </div>
    );
};

const CategoryDetailManager = ({ images, setImages }: { images: any, setImages: React.Dispatch<React.SetStateAction<any>> }) => {
    const updateImage = (key: string, val: string) => { setImages((prev: any) => ({ ...prev, [key]: val })); };
    const categories = [ { key: 'networking', label: '스터디 & 네트워킹 상세' }, { key: 'minddate', label: '마인드데이트 상세' }, { key: 'crew', label: '임장 크루 상세' }, { key: 'lecture', label: '재테크 강의 상세' } ];
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><FileText size={20} className="text-orange-500" /> 카테고리 이용 가이드 (상세 이미지)</h3>
            <p className="text-sm text-slate-500 mb-6">각 카테고리 페이지 상단(필터 아래)에 노출되는 상세 설명 이미지입니다. 접기/펴기 형태로 제공됩니다.<br/><span className="text-orange-500 font-bold">* 권장 가로 사이즈: 1200px 이상 (세로는 자유)</span></p>
            <div className="space-y-6">{categories.map((cat) => ( <div key={cat.key} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50"> <ImageUploadField label={cat.label} value={images[cat.key]} onChange={(val) => updateImage(cat.key, val)} /> </div> ))}</div>
        </div>
    );
};
const BrandTaglineManager = ({ tagline, setTagline }: { tagline: string, setTagline: (val: string) => void }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Type size={20} className="text-slate-600" /> 브랜드 문구 (Tagline) 관리</h3>
            <p className="text-sm text-slate-500 mb-3">홈 화면의 배너 아래에 노출되는 플랫폼 소개 문구입니다.</p>
            <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"/>
        </div>
    );
};
const FontSettingsManager = ({ currentFont, setFont }: { currentFont: string, setFont: (val: string) => void }) => {
    const fonts = [ { name: 'Pretendard', label: '프리텐다드 (Pretendard) - 모던/깔끔 (추천)' }, { name: 'Gmarket Sans', label: 'G마켓 산스 - 힙/볼드' }, { name: 'Noto Sans KR', label: '노토 산스 (Noto Sans KR) - 기본' } ];
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Type size={20} className="text-emerald-500" /> 글로벌 폰트 설정</h3>
            <p className="text-sm text-slate-500 mb-4">플랫폼 전체에 적용될 메인 폰트를 선택하세요. 변경사항은 즉시 반영됩니다.</p>
            <div className="space-y-3">{fonts.map((f) => ( <label key={f.name} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${currentFont === f.name ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:bg-slate-50'}`}> <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${currentFont === f.name ? 'border-emerald-500' : 'border-slate-300'}`}> {currentFont === f.name && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>} </div> <input type="radio" name="font" value={f.name} checked={currentFont === f.name} onChange={() => setFont(f.name)} className="hidden" /> <span className="font-medium text-slate-800" style={{fontFamily: f.name === 'Gmarket Sans' ? 'GmarketSans' : f.name === 'Noto Sans KR' ? 'Noto Sans KR' : 'Pretendard'}}>{f.label}</span> </label> ))}</div>
        </div>
    );
};

const BriefingManager = ({ 
    briefing, setBriefing, showToast 
}: { 
    briefing: BriefingItem[], 
    setBriefing: React.Dispatch<React.SetStateAction<BriefingItem[]>>,
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [editingItem, setEditingItem] = useState<BriefingItem | null>(null);

    const generateWithAI = async () => {
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
            
            const prompt = `
                오늘 대한민국 부동산 시장의 가장 중요한 뉴스 3가지를 찾아서 요약해줘.
                각 뉴스는 한 줄로 요약해야 하며, 반드시 '키워드: 요약내용' 형식을 지켜줘.
                예시:
                금리 동결: 한국은행이 기준금리를 3.5%로 동결하며 부동산 시장 관망세 지속.
                강남 재건축: 은마아파트 재건축 심의 통과로 호가 2억 상승.
                전세 사기 예방: 정부, 전세금 반환 보증 가입 기준 강화 발표.

                Markdown 형식을 사용하지 말고 순수 텍스트로만 출력해줘.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}]
                }
            });

            const text = response.text || "";
            const lines = text.split('\n').filter(line => line.trim() !== '' && line.includes(':'));
            
            if (lines.length >= 3) {
                const newItems = lines.slice(0, 3).map((line, idx) => {
                    const parts = line.split(':');
                    const highlight = parts[0].trim();
                    const content = parts.slice(1).join(':').trim();
                    return { id: Date.now() + idx, highlight: highlight, text: `${highlight}: ${content}` };
                });
                setBriefing(newItems);
                showToast("AI가 최신 뉴스를 성공적으로 요약했습니다!", "success");
            } else {
                showToast("AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.", "error");
            }

        } catch (error) {
            console.error(error);
            showToast("AI 뉴스 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const updateItem = () => {
        if (editingItem) {
            setBriefing(prev => prev.map(item => item.id === editingItem.id ? editingItem : item));
            setEditingItem(null);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Sparkles size={20} className="text-yellow-500" /> 오늘의 숏-인사이트 (AI)
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">홈 화면 '오늘의 숏-인사이트' 영역에 노출될 부동산 뉴스 3가지를 관리합니다.</p>
                </div>
                <button 
                    onClick={generateWithAI}
                    disabled={isLoading}
                    className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {isLoading ? 'AI가 뉴스 찾는 중...' : 'AI로 최신 뉴스 가져오기'}
                </button>
            </div>

            <div className="space-y-4">
                {briefing.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-4 items-start group hover:border-indigo-300 transition-colors">
                        <div className="flex-1">
                            {editingItem?.id === item.id ? (
                                <div className="space-y-2">
                                    <input 
                                        type="text" 
                                        value={editingItem.highlight} 
                                        onChange={(e) => setEditingItem({...editingItem, highlight: e.target.value})}
                                        className="font-bold text-slate-900 border border-slate-300 rounded px-2 py-1 text-sm w-full"
                                        placeholder="핵심 키워드"
                                    />
                                    <input 
                                        type="text" 
                                        value={editingItem.text} 
                                        onChange={(e) => setEditingItem({...editingItem, text: e.target.value})}
                                        className="text-slate-600 border border-slate-300 rounded px-2 py-1 text-sm w-full"
                                        placeholder="전체 내용"
                                    />
                                    <div className="flex gap-2 justify-end mt-2">
                                        <button onClick={() => setEditingItem(null)} className="text-xs text-slate-500 hover:text-slate-700">취소</button>
                                        <button onClick={updateItem} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded font-bold">저장</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                        <span className="font-bold text-slate-900">{item.highlight}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 pl-6">{item.text.replace(item.highlight + ':', '').trim()}</p>
                                </>
                            )}
                        </div>
                        {editingItem?.id !== item.id && (
                             <button onClick={() => setEditingItem(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                 <Edit3 size={18} />
                             </button>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl text-xs text-indigo-700 flex items-center gap-2">
                <Lightbulb size={14}/>
                <span>AI가 실시간 검색을 통해 정보를 가져오므로, 실제 뉴스와 약간의 시차가 있을 수 있습니다.</span>
            </div>
        </div>
    );
};

const SettlementManager = ({ items, commissionRate, setCommissionRate }: { items: AnyItem[], commissionRate: number, setCommissionRate: (val: number) => void }) => {
    const [localItems, setLocalItems] = useState<AnyItem[]>(items);

    const parsePrice = (price?: string | null) => { if (!price || price === '무료') return 0; return parseInt(price.replace(/[^0-9]/g, ''), 10); };
    const calculateItemRevenue = (item: AnyItem) => { const price = parsePrice(item.price); let count = 0; if (item.categoryType === 'crew') { const crew = item as CrewItem; count = crew.type === 'report' ? (crew.purchaseCount || 0) : 15; } else if (item.categoryType === 'networking') { const net = item as NetworkingItem; count = net.currentParticipants || 0; } else if (item.categoryType === 'lecture') { count = 45; } else if (item.categoryType === 'minddate') { const match = item as MatchingItem; count = (match.genderRatio?.male || 0) + (match.genderRatio?.female || 0); } return price * count; };
    
    const settlementData = localItems.map(item => {
        const totalRevenue = calculateItemRevenue(item);
        const fee = Math.floor(totalRevenue * (commissionRate / 100));
        const netAmount = totalRevenue - fee;
        
        const isPlatformManaged = item.categoryType === 'minddate'; 
        const type = isPlatformManaged ? 'payable' : 'receivable'; 
        const settlementAmount = type === 'payable' ? netAmount : fee; 

        const isSettled = (item as any).settlementStatus === 'settled';
        let displayStatus = 'pending';
        if (item.status === 'ended') {
            displayStatus = isSettled ? 'completed' : 'pending';
        } else {
            displayStatus = 'active'; 
        }

        return { ...item, totalRevenue, fee, netAmount, settlementAmount, type, settlementStatus: displayStatus };
    }).filter(i => i.totalRevenue > 0);

    const handleConfirmPayment = (id: number) => {
        if(confirm("입금 확인 처리를 하시겠습니까?")) {
            setLocalItems(prev => prev.map(item => 
                item.id === id ? { ...item, settlementStatus: 'settled' } : item
            ));
        }
    };

    const totalToPay = settlementData.filter(i => i.type === 'payable').reduce((acc, cur) => acc + cur.settlementAmount, 0);
    const totalToCollect = settlementData.filter(i => i.type === 'receivable').reduce((acc, cur) => acc + cur.settlementAmount, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6"> <div> <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Settings size={20} className="text-slate-500" /> 정산 및 수수료 설정</h3> <p className="text-sm text-slate-500">플랫폼 수수료율 설정 및 정산 대시보드입니다.</p> </div> <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"> <span className="text-sm font-bold text-slate-600">현재 수수료율</span> <div className="flex items-center gap-1"> <input type="number" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} className="w-16 text-right font-black text-xl bg-transparent outline-none text-indigo-600 border-b-2 border-indigo-200 focus:border-indigo-600 transition-colors" /> <span className="text-lg font-bold text-indigo-600">%</span> </div> </div> </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                    <div className="bg-orange-50 p-5 rounded-xl border border-orange-100"> 
                        <p className="text-sm font-bold text-orange-600 mb-1 flex items-center gap-2"><Wallet size={16}/> 호스트 지급 예정액 (Platform -> Host)</p> 
                        <p className="text-xs text-orange-400 mb-2">마인드데이트 등 플랫폼 결제 건</p>
                        <p className="text-2xl font-black text-orange-900">₩ {totalToPay.toLocaleString()}</p> 
                    </div> 
                    <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100"> 
                        <p className="text-sm font-bold text-emerald-600 mb-1 flex items-center gap-2"><FileText size={16}/> 수수료 청구 예정액 (Host -> Platform)</p> 
                        <p className="text-xs text-emerald-400 mb-2">크루/강의 등 호스트 직접 결제 건</p>
                        <p className="text-2xl font-black text-emerald-900">₩ {totalToCollect.toLocaleString()}</p> 
                    </div> 
                </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"> 
                <div className="p-6 border-b border-slate-100 flex items-center justify-between"> <h3 className="font-bold text-lg text-slate-800">정산 상세 내역 <span className="text-slate-400 text-sm font-normal">({settlementData.length})</span></h3> </div> 
                <div className="overflow-x-auto"> 
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead> 
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider"> 
                                <th className="p-4 font-semibold border-b border-slate-100">구분</th> 
                                <th className="p-4 font-semibold border-b border-slate-100">콘텐츠 정보</th> 
                                <th className="p-4 font-semibold border-b border-slate-100 text-right">총 매출</th> 
                                <th className="p-4 font-semibold border-b border-slate-100 text-right">플랫폼 수수료</th> 
                                <th className="p-4 font-semibold border-b border-slate-100 text-right">정산 금액</th> 
                                <th className="p-4 font-semibold border-b border-slate-100 text-center">관리</th> 
                            </tr> 
                        </thead> 
                        <tbody className="divide-y divide-slate-100"> 
                            {settlementData.map((item) => ( 
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors"> 
                                    <td className="p-4">
                                        <Badge variant={item.type === 'payable' ? 'warning' : 'success'}>
                                            {item.type === 'payable' ? '지급 대상' : '청구 대상'}
                                        </Badge>
                                    </td>
                                    <td className="p-4"> 
                                        <div className="flex items-center gap-3"> 
                                            <div> 
                                                <p className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</p> 
                                                <p className="text-xs text-slate-400">{item.author} (호스트)</p> 
                                            </div> 
                                        </div> 
                                    </td> 
                                    <td className="p-4 text-right text-sm text-slate-600">₩ {item.totalRevenue.toLocaleString()}</td> 
                                    <td className="p-4 text-right text-sm text-slate-500">₩ {item.fee.toLocaleString()}</td> 
                                    <td className={`p-4 text-right font-bold ${item.type === 'payable' ? 'text-orange-600' : 'text-emerald-600'}`}>
                                        {item.type === 'payable' ? '-' : '+'} ₩ {item.settlementAmount.toLocaleString()}
                                    </td> 
                                    <td className="p-4 text-center"> 
                                        {item.type === 'payable' ? (
                                            <button className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg hover:bg-orange-200 transition-colors flex items-center gap-1 mx-auto">
                                                <Wallet size={12}/> 정산금 이체
                                            </button>
                                        ) : (
                                            item.settlementStatus === 'completed' ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 mx-auto">
                                                    <CheckCircle2 size={12}/> 정산 완료
                                                </span>
                                            ) : (
                                                <div className="flex gap-2 justify-center">
                                                    <button className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1">
                                                        <Send size={12}/> 청구서
                                                    </button>
                                                    {item.settlementStatus === 'pending' && (
                                                        <button 
                                                            onClick={() => handleConfirmPayment(item.id)}
                                                            className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                                                        >
                                                            <CheckCircle2 size={12}/> 입금 확인
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </td> 
                                </tr> 
                            ))} 
                        </tbody> 
                    </table> 
                </div> 
            </div>
        </div>
    );
};

interface AdminPageProps {
  globalSlides: Slide[];
  setGlobalSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
  globalNotis: string[];
  setGlobalNotis: React.Dispatch<React.SetStateAction<string[]>>;
  categoryHeaders: { [key: string]: CategoryHeaderInfo };
  setCategoryHeaders: React.Dispatch<React.SetStateAction<{ [key: string]: CategoryHeaderInfo }>>;
  myPageBanner: string;
  setMyPageBanner: React.Dispatch<React.SetStateAction<string>>;
  brandTagline: string;
  setBrandTagline: React.Dispatch<React.SetStateAction<string>>;
  globalFont: string;
  setGlobalFont: React.Dispatch<React.SetStateAction<string>>;
  commissionRate: number;
  setCommissionRate: React.Dispatch<React.SetStateAction<number>>;
  categoryDetailImages: any;
  setCategoryDetailImages: React.Dispatch<React.SetStateAction<any>>;
  dailyBriefing: BriefingItem[];
  setDailyBriefing: React.Dispatch<React.SetStateAction<BriefingItem[]>>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ 
    globalSlides, setGlobalSlides, 
    globalNotis, setGlobalNotis,
    categoryHeaders, setCategoryHeaders,
    myPageBanner, setMyPageBanner,
    brandTagline, setBrandTagline,
    globalFont, setGlobalFont,
    commissionRate, setCommissionRate,
    categoryDetailImages, setCategoryDetailImages,
    dailyBriefing, setDailyBriefing,
    showToast
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [crewData, setCrewData] = useState<AnyItem[]>(crewList);
  const [networkingData, setNetworkingData] = useState<AnyItem[]>(networkingList);
  const [minddateData, setMinddateData] = useState<AnyItem[]>(matchingList);
  const [lectureData, setLectureData] = useState<AnyItem[]>(lectureList);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingItem, setEditingItem] = useState<AnyItem | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleEditClick = (item: AnyItem) => { setEditingItem(item); };
  const handleSaveItem = (updatedItem: AnyItem) => {
    const updateList = (list: AnyItem[], setList: React.Dispatch<React.SetStateAction<AnyItem[]>>) => { setList(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item)); };
    if (updatedItem.categoryType === 'crew') updateList(crewData, setCrewData);
    else if (updatedItem.categoryType === 'networking') updateList(networkingData, setNetworkingData);
    else if (updatedItem.categoryType === 'minddate') updateList(minddateData, setMinddateData);
    else if (updatedItem.categoryType === 'lecture') updateList(lectureData, setLectureData);
    setEditingItem(null);
    showToast("콘텐츠가 수정되었습니다.", "success");
  };
  const handleUserEdit = (user: User) => { setEditingUser(user); };
  const handleSaveUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setEditingUser(null);
    showToast("사용자 권한이 업데이트되었습니다.", "success");
  };

  const allItems = [...crewData, ...networkingData, ...minddateData, ...lectureData];

  const renderContent = () => {
    switch(activeTab) {
        case 'dashboard':
            return (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="총 회원 수" value="12,450" change="+12.5%" icon={Users} color="bg-blue-500" />
                        <StatCard title="누적 매출액" value="₩142.5M" change="+8.2%" icon={DollarSign} color="bg-emerald-500" />
                        <StatCard title="활성 모임" value={crewData.length + networkingData.length} change="+24.0%" icon={Activity} color="bg-indigo-500" />
                        <StatCard title="일일 방문자" value="3,200" change="+4.5%" icon={TrendingUp} color="bg-orange-500" />
                    </div>
                </div>
            );
        case 'permissions': return <UserTable users={users} onEdit={handleUserEdit} />;
        case 'settlement': return <SettlementManager items={allItems} commissionRate={commissionRate} setCommissionRate={setCommissionRate} />;
        case 'home_settings': return <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-8"><FontSettingsManager currentFont={globalFont} setFont={setGlobalFont} /><BrandTaglineManager tagline={brandTagline} setTagline={setBrandTagline} /><NotificationManager notifications={globalNotis} setNotifications={setGlobalNotis} /><BannerManager slides={globalSlides} setSlides={setGlobalSlides} /><CategoryHeaderManager headers={categoryHeaders} setHeaders={setCategoryHeaders} /><MyPageBannerManager banner={myPageBanner} setBanner={setMyPageBanner} /><CategoryDetailManager images={categoryDetailImages} setImages={setCategoryDetailImages} /></div>;
        case 'briefing': return <BriefingManager briefing={dailyBriefing} setBriefing={setDailyBriefing} showToast={showToast} />;
        case 'crew': return <DataTable title="임장 크루" data={crewData} onEdit={handleEditClick} />;
        case 'networking': return <DataTable title="네트워킹/스터디" data={networkingData} onEdit={handleEditClick} />;
        case 'minddate': return <DataTable title="마인드데이트" data={minddateData} onEdit={handleEditClick} />;
        case 'lecture': return <DataTable title="강의/VOD" data={lectureData} onEdit={handleEditClick} />;
        default: return <div className="p-20 text-center text-slate-400">준비 중인 페이지입니다.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      {/* Mobile Menu Button - Floating or Header */}
      
      <main className="flex-1 w-full md:ml-64 p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 md:gap-0">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <Menu size={24} />
                </button>
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 mb-1">{activeTab === 'dashboard' ? '대시보드' : activeTab === 'permissions' ? '관리자 권한 관리' : activeTab === 'home_settings' ? '배너/디자인 관리' : activeTab === 'settlement' ? '정산 및 수수료 관리' : activeTab === 'briefing' ? '오늘의 인사이트 (AI)' : activeTab === 'crew' ? '임장 크루 관리' : activeTab === 'networking' ? '네트워킹 관리' : activeTab === 'minddate' ? '마인드데이트 관리' : '강의 관리'}</h1>
                    <p className="text-slate-500 text-xs md:text-sm">플랫폼 현황을 한눈에 확인하고 관리하세요.</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <div className="relative flex-1 md:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="검색..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-full md:w-64 shadow-sm" />
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold shadow-sm border border-indigo-200 flex-shrink-0">A</div>
            </div>
        </header>
        {renderContent()}
        {editingItem && ( <EditModal item={editingItem} onClose={() => setEditingItem(null)} onSave={handleSaveItem} /> )}
        {editingUser && ( <PermissionModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} /> )}
      </main>
    </div>
  );
};

export default AdminPage;
