
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Heart, Map, GraduationCap, LogIn, Settings, User as UserIcon, Lock, Youtube, Instagram, MessageCircle, BookOpen } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  onLoginClick: () => void;
  currentUser: User | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLoginClick, currentUser, showToast }) => {
  const navigate = useNavigate();
  const navItems = [
    { to: '/', icon: Home, label: '홈' },
    { to: '/networking', icon: Users, label: '스터디 & 네트워킹' },
    { to: '/minddate', icon: Heart, label: '마인드데이트' },
    { to: '/crew', icon: Map, label: '임장 크루' },
    { to: '/lecture', icon: GraduationCap, label: '재테크 강의' },
    { to: '/mypage', icon: UserIcon, label: '마이페이지' },
  ];

  const isAdmin = currentUser && (
      currentUser.roles.includes('super_admin') || 
      currentUser.roles.some(role => role.includes('manager'))
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-white border-r border-slate-200 z-40 flex flex-col transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-extrabold text-lg">임</span>
        </div>
        <span className="font-extrabold text-2xl text-slate-900 hidden lg:block tracking-tight">
            임풋
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={22} className={`group-hover:scale-110 transition-transform duration-200 ${item.label === '마인드데이트' ? 'text-pink-500' : ''}`} />
            <span className="hidden lg:block">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-3">
        {currentUser ? (
             <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 mb-2">
                 <img src={currentUser.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200" />
                 <div className="hidden lg:block overflow-hidden">
                     <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                     <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                 </div>
             </div>
        ) : (
            <button 
                onClick={onLoginClick}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
                <LogIn size={22} />
                <span className="hidden lg:block">로그인</span>
            </button>
        )}
        
        {isAdmin && (
            <button 
                onClick={() => {
                    navigate('/admin');
                    showToast("관리자 모드로 전환되었습니다.", "info");
                }}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all group border border-indigo-100"
            >
                <Lock size={22} className="group-hover:scale-110 transition-transform"/>
                <span className="hidden lg:block font-bold">관리자 모드</span>
            </button>
        )}

        <div className="flex justify-around pt-2 border-t border-slate-50">
            <a href="#" className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Youtube size={18}/></a>
            <a href="#" className="p-2 text-slate-400 hover:text-pink-500 transition-colors"><Instagram size={18}/></a>
            <a href="#" className="p-2 text-slate-400 hover:text-green-500 transition-colors"><BookOpen size={18}/></a>
            <a href="#" className="p-2 text-slate-400 hover:text-yellow-400 transition-colors"><MessageCircle size={18}/></a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
