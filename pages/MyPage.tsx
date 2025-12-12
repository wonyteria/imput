
import React, { useState } from 'react';
import { AnyItem, User } from '../types';
import Card from '../components/Card';
import { networkingList, matchingList, crewList, lectureList } from '../constants';
import { Crown, Trophy, Target, Star, FolderOpen, Heart } from 'lucide-react';

interface MyPageProps {
  likedIds: number[];
  appliedIds: number[];
  unlockedIds: number[]; 
  onItemClick: (item: AnyItem) => void;
  toggleLike: (id: number) => void;
  bannerImg?: string;
  currentUser: User | null;
}

const MyPage: React.FC<MyPageProps> = ({ likedIds, appliedIds, unlockedIds, onItemClick, toggleLike, bannerImg, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'liked' | 'applied'>('liked');
  
  const allItems = [...networkingList, ...matchingList, ...crewList, ...lectureList];
  const likedItems = allItems.filter(item => likedIds.includes(item.id));
  const myLibraryItems = allItems.filter(item => appliedIds.includes(item.id) || unlockedIds.includes(item.id));

  // --- Gamification Logic ---
  // XP Rules: Like = 10xp, Apply/Purchase = 50xp
  const totalXP = (likedItems.length * 10) + (myLibraryItems.length * 50);
  
  // Level Logic
  let level = 1;
  let rankName = "임린이";
  let nextRankName = "임대장";
  let minXP = 0;
  let maxXP = 300;
  let icon = "🐣";

  if (totalXP >= 300 && totalXP < 1000) {
      level = 2;
      rankName = "임대장";
      nextRankName = "부동산 고수";
      minXP = 300;
      maxXP = 1000;
      icon = "👣";
  } else if (totalXP >= 1000) {
      level = 3;
      rankName = "부동산 고수";
      nextRankName = "마스터";
      minXP = 1000;
      maxXP = 3000;
      icon = "👑";
  }

  const progressPercent = Math.min(100, Math.max(0, ((totalXP - minXP) / (maxXP - minXP)) * 100));

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Banner Section */}
      <div className="rounded-3xl mb-8 shadow-lg relative overflow-hidden group h-[200px]">
        <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: `url(${bannerImg || 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=1600'})` }}
        ></div>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">마이페이지</h1>
            <p className="text-slate-200">나의 성장 기록과 관심 목록을 확인하세요.</p>
        </div>
      </div>
      
      {/* Profile & Gamification Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 relative -mt-16 mx-4 md:mx-0 z-20 overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center text-center md:items-start md:text-left flex-shrink-0">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-4xl shadow-inner border-4 border-white mb-3 relative">
                    {currentUser ? <img src={currentUser.avatar} className="w-full h-full rounded-full" /> : icon}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                        Lv.{level}
                    </div>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{currentUser ? currentUser.name : '비회원'}</h2>
                <p className="text-slate-500 text-sm font-medium">{rankName} 단계</p>
            </div>

            {/* Stats & Progress */}
            <div className="flex-1 w-full">
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-xs text-slate-400 mb-1">총 경험치</p>
                        <p className="text-lg font-black text-slate-800">{totalXP} XP</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setActiveTab('liked')}>
                        <p className="text-xs text-slate-400 mb-1">찜한 목록</p>
                        <p className="text-lg font-black text-pink-500">{likedItems.length}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setActiveTab('applied')}>
                        <p className="text-xs text-slate-400 mb-1">내 서재</p>
                        <p className="text-lg font-black text-indigo-500">{myLibraryItems.length}</p>
                    </div>
                </div>

                {/* Level Progress Bar */}
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200 mr-2">
                                <Trophy size={12} className="inline mr-1 mb-0.5"/> Level Up
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-indigo-600">
                                {nextRankName}까지 {maxXP - totalXP} XP 남음
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-indigo-100">
                        <div style={{ width: `${progressPercent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-1000 ease-out"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 sticky top-0 bg-slate-50/95 backdrop-blur z-20 pt-4">
        <button onClick={() => setActiveTab('liked')} className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'liked' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
            찜한 목록
            {activeTab === 'liked' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></div>}
        </button>
        <button onClick={() => setActiveTab('applied')} className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'applied' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
            내 서재 (신청/구매)
            {activeTab === 'applied' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></div>}
        </button>
      </div>

      {/* Content Grid with Staggered Animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeTab === 'liked' ? (
            likedItems.length > 0 ? (
                likedItems.map((item, index) => (
                    <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 50}ms` }}>
                        <Card item={item} onClick={() => onItemClick(item)} isLiked={true} onToggleLike={() => toggleLike(item.id)} />
                    </div>
                ))
            ) : (
                <div className="col-span-full py-24 text-center bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4 text-pink-300">
                        <Heart size={32} />
                    </div>
                    <p className="text-slate-800 font-bold text-lg mb-1">아직 찜한 모임이 없어요.</p>
                    <p className="text-slate-400 text-sm">관심 있는 모임에 하트를 눌러보세요!</p>
                </div>
            )
        ) : (
            myLibraryItems.length > 0 ? (
                myLibraryItems.map((item, index) => (
                    <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 50}ms` }}>
                        <Card item={item} onClick={() => onItemClick(item)} isLiked={likedIds.includes(item.id)} onToggleLike={() => toggleLike(item.id)} />
                    </div>
                ))
            ) : (
                <div className="col-span-full py-24 text-center bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                     <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-300">
                        <FolderOpen size={32} />
                    </div>
                    <p className="text-slate-800 font-bold text-lg mb-1">내 서재가 비어있어요.</p>
                    <p className="text-slate-400 text-sm">모임을 신청하거나 리포트를 구매하면 여기에 보관됩니다.</p>
                </div>
            )
        )}
      </div>
    </div>
  );
};

export default MyPage;
