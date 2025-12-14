
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Modal from './components/Modal';
import Toast from './components/Toast'; 
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import { networkingList, matchingList, crewList, lectureList, slides as initialSlides } from './constants';
import { AnyItem, User, Slide, BriefingItem, CategoryHeaderInfo } from './types';
import { X, ArrowUp } from 'lucide-react';

// --- SVG Icons for Social Login ---
const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M12 3C7.58 3 4 5.28 4 8.1c0 1.97 1.74 3.72 4.36 4.5-.2.74-.77 2.68-.88 3.07-.16.59.22.58.46.42.19-.13 3.1-2.09 4.33-2.92.56.08 1.15.12 1.73.12 4.42 0 8-2.28 8-5.1C22 5.28 18.42 3 12 3z"/></svg>
);
const NaverIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M16.036 18.237h4.865V5.763h-4.865l-6.866 9.873V5.763H4.295v12.474h4.875l6.866-9.873v9.873z"/></svg>
);
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);

const App: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<AnyItem | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // --- Global State Management ---
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);

  // --- Admin Settings ---
  const [commissionRate, setCommissionRate] = useState(15); // Default 15% fee

  // --- Theme State ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // --- Initialize User & Data from LocalStorage ---
  useEffect(() => {
    // 1. Load User
    const storedUser = localStorage.getItem('imfoot_user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        
        // 2. Load User Data (Keys are prefixed with user ID for multi-user simulation)
        const userLikes = localStorage.getItem(`likes_${user.id}`);
        const userApplies = localStorage.getItem(`applies_${user.id}`);
        const userUnlocks = localStorage.getItem(`unlocks_${user.id}`);

        if (userLikes) setLikedIds(JSON.parse(userLikes));
        if (userApplies) setAppliedIds(JSON.parse(userApplies));
        if (userUnlocks) setUnlockedIds(JSON.parse(userUnlocks));
    }
  }, []);

  // --- Sync Data to LocalStorage whenever it changes ---
  useEffect(() => {
    if (currentUser) {
        localStorage.setItem(`likes_${currentUser.id}`, JSON.stringify(likedIds));
    }
  }, [likedIds, currentUser]);

  useEffect(() => {
    if (currentUser) {
        localStorage.setItem(`applies_${currentUser.id}`, JSON.stringify(appliedIds));
    }
  }, [appliedIds, currentUser]);

  useEffect(() => {
    if (currentUser) {
        localStorage.setItem(`unlocks_${currentUser.id}`, JSON.stringify(unlockedIds));
    }
  }, [unlockedIds, currentUser]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // --- Scroll To Top State ---
  const [showScrollTop, setShowScrollTop] = useState(false);

  // --- Toast State ---
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => setToast(null);

  // --- Home & Design Settings State ---
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [brandTagline, setBrandTagline] = useState("나와 같은 방향을 걷는 사람들을 만나는 곳, 임풋");
  const [globalFont, setGlobalFont] = useState('Pretendard');
  const [notifications, setNotifications] = useState<string[]>([
    "🔥 [마감임박] 강남 청약 스터디 2자리 남았습니다!",
    "💘 [매칭] 방금 '30대 직장인 소개팅' 남성 1명 신청완료",
    "👟 [모집] 마포구 임장 크루 리더가 코스를 업데이트했습니다.",
    "🎓 [신규] '2025 부동산 전망' VOD가 업로드 되었습니다."
  ]);
  
  // --- Daily Briefing State (Shared between Admin & Home) ---
  const [dailyBriefing, setDailyBriefing] = useState<BriefingItem[]>([
      { id: 1, text: "금리 인하 기대감: 코픽스 금리 2개월 연속 하락, 대출 숨통 트이나?", highlight: "금리 인하 기대감" },
      { id: 2, text: "강남 3구: 토지거래허가구역 재지정 이슈 체크 필수.", highlight: "강남 3구" },
      { id: 3, text: "임풋 Tip: 지금은 추격 매수보다 급매물 모니터링이 필요한 시점.", highlight: "임풋 Tip" }
  ]);

  // --- Category Header Texts (Replaces Images) ---
  const [categoryHeaders, setCategoryHeaders] = useState<{[key: string]: CategoryHeaderInfo}>({
      networking: { title: "📚 스터디 & 네트워킹", description: "함께 공부하고 성장하는 부동산 커뮤니티." },
      minddate: { title: "💘 마인드데이트", description: "재테크 가치관이 맞는 소중한 인연을 찾아보세요." },
      crew: { title: "🏃 임장 크루", description: "혼자서는 막막한 임장, 전문가 리더와 함께 걸어요." },
      lecture: { title: "🎓 재테크 강의", description: "검증된 전문가의 노하우를 배우는 프리미엄 클래스." }
  });

  // --- MyPage Banner (Still Image) ---
  const [myPageBanner, setMyPageBanner] = useState("https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=1600");

  // --- Category Detail Images (Accordion) ---
  const [categoryDetailImages, setCategoryDetailImages] = useState({
    networking: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2000",
    minddate: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=2000",
    crew: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=2000",
    lecture: "https://images.unsplash.com/photo-1544531696-fa3693fb4b38?auto=format&fit=crop&q=80&w=2000"
  });

  useEffect(() => {
    const fontMap: {[key: string]: string} = {
        'Pretendard': '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
        'Gmarket Sans': '"GmarketSans", sans-serif',
        'Noto Sans KR': '"Noto Sans KR", sans-serif'
    };
    document.body.style.fontFamily = fontMap[globalFont] || fontMap['Pretendard'];
  }, [globalFont]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemClick = (item: AnyItem) => {
    setSelectedItem(item);
  };

  const closeItemModal = () => {
    setSelectedItem(null);
  };

  // --- Helper to calculate user stats (Level/Rank) ---
  const calculateStats = () => {
      const totalXP = (likedIds.length * 10) + ((appliedIds.length + unlockedIds.length) * 50);
      let level = 1;
      let rankName = "임린이";
      
      if (totalXP >= 300 && totalXP < 1000) {
          level = 2;
          rankName = "임대장";
      } else if (totalXP >= 1000) {
          level = 3;
          rankName = "부동산 고수";
      }
      return { level, rankName, totalXP };
  };
  const { level, rankName } = calculateStats();

  const toggleLike = (id: number) => {
    if (!currentUser) {
        setIsLoginOpen(true);
        showToast("로그인이 필요한 서비스입니다.", "error");
        return;
    }
    const isLiked = likedIds.includes(id);
    setLikedIds(prev => isLiked ? prev.filter(itemId => itemId !== id) : [...prev, id]);
    if (!isLiked) {
        showToast("관심 목록 추가! (+10 XP)", "success");
    } else {
        showToast("관심 목록에서 삭제되었습니다.", "info");
    }
  };

  const handleApply = (id: number) => {
    if (!currentUser) {
        setIsLoginOpen(true);
        showToast("로그인이 필요한 서비스입니다.", "error");
        return;
    }
    if (!appliedIds.includes(id)) {
      setAppliedIds(prev => [...prev, id]);
      showToast("신청 완료! 경험치가 상승했습니다 (+50 XP)", "success");
    }
  };

  const handleUnlock = (id: number) => {
    if (!currentUser) {
        setIsLoginOpen(true);
        showToast("로그인이 필요한 서비스입니다.", "error");
        return;
    }
    if (!unlockedIds.includes(id)) {
      setUnlockedIds(prev => [...prev, id]);
      showToast("리포트 잠금 해제! (+50 XP)", "success");
    }
  };

  // --- Real Login Simulation ---
  const handleLogin = (provider: 'kakao' | 'naver' | 'google') => {
      let newUser: User;
      const timestamp = new Date().toISOString().split('T')[0];

      if (provider === 'kakao') {
          newUser = { id: 1001, name: '김카카오', email: 'kakao_user@imfoot.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', roles: [], joinDate: timestamp };
      } else if (provider === 'naver') {
          newUser = { id: 1002, name: '이나이버', email: 'naver_user@imfoot.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', roles: [], joinDate: timestamp };
      } else {
          newUser = { id: 1003, name: '박구글', email: 'google_user@imfoot.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', roles: ['super_admin'], joinDate: timestamp };
      }

      localStorage.setItem('imfoot_user', JSON.stringify(newUser));
      setCurrentUser(newUser);

      const userLikes = localStorage.getItem(`likes_${newUser.id}`);
      const userApplies = localStorage.getItem(`applies_${newUser.id}`);
      const userUnlocks = localStorage.getItem(`unlocks_${newUser.id}`);

      setLikedIds(userLikes ? JSON.parse(userLikes) : []);
      setAppliedIds(userApplies ? JSON.parse(userApplies) : []);
      setUnlockedIds(userUnlocks ? JSON.parse(userUnlocks) : []);

      showToast(`${newUser.name}님, 환영합니다!`, "success");
      setIsLoginOpen(false);
  };

  const handleLogout = () => {
      localStorage.removeItem('imfoot_user');
      setCurrentUser(null);
      setLikedIds([]);
      setAppliedIds([]);
      setUnlockedIds([]);
      showToast("로그아웃 되었습니다.", "info");
      window.location.reload(); 
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('imfoot_user', JSON.stringify(updatedUser));
  };

  return (
    <HashRouter>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <Routes>
        <Route 
          path="/admin" 
          element={
            <AdminPage 
                globalSlides={slides} 
                setGlobalSlides={setSlides}
                globalNotis={notifications}
                setGlobalNotis={setNotifications}
                categoryHeaders={categoryHeaders}
                setCategoryHeaders={setCategoryHeaders}
                myPageBanner={myPageBanner}
                setMyPageBanner={setMyPageBanner}
                brandTagline={brandTagline}
                setBrandTagline={setBrandTagline}
                globalFont={globalFont}
                setGlobalFont={setGlobalFont}
                commissionRate={commissionRate}
                setCommissionRate={setCommissionRate}
                categoryDetailImages={categoryDetailImages}
                setCategoryDetailImages={setCategoryDetailImages}
                dailyBriefing={dailyBriefing}
                setDailyBriefing={setDailyBriefing}
                showToast={showToast}
            />
          } 
        />

        <Route
          path="*"
          element={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-300">
              <div className="hidden lg:block">
                  <Sidebar 
                    onLoginClick={() => setIsLoginOpen(true)} 
                    currentUser={currentUser}
                    showToast={showToast}
                    isDarkMode={isDarkMode}
                    toggleTheme={toggleTheme}
                    onLogout={handleLogout}
                    userLevel={level}
                    userRank={rankName}
                  />
              </div>

              <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden">
                <main className="flex-1 p-4 md:p-6 lg:p-10 pb-24 lg:pb-10 relative">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center justify-between mb-6 pt-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
                                <span className="text-white dark:text-slate-900 font-extrabold text-sm">임</span>
                            </div>
                            <span className="font-extrabold text-xl text-slate-900 dark:text-white">임풋</span>
                        </div>
                        <div className="flex items-center gap-3">
                             {/* Mobile Theme Toggle */}
                            <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {isDarkMode ? '☀️' : '🌙'}
                            </button>
                            {currentUser ? (
                                <div className="flex items-center gap-2" onClick={handleLogout}>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">Lv.{level} {currentUser.name}</p>
                                    </div>
                                    <img src={currentUser.avatar} className="w-8 h-8 rounded-full border border-slate-200" alt="profile"/>
                                </div>
                            ) : (
                                <button onClick={() => setIsLoginOpen(true)} className="text-sm font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                                    로그인
                                </button>
                            )}
                        </div>
                    </div>

                    <Routes>
                        <Route path="/" element={<Home onItemClick={handleItemClick} likedIds={likedIds} toggleLike={toggleLike} slides={slides} notifications={notifications} brandTagline={brandTagline} dailyBriefing={dailyBriefing} />} />
                        <Route path="/networking" element={<CategoryPage categoryType="networking" items={networkingList} headerInfo={categoryHeaders.networking} detailImage={categoryDetailImages.networking} badges={[{label: "전체", value: "all"}, {label: "모집중", value: "open"}, {label: "종료됨", value: "ended"}]} onItemClick={handleItemClick} likedIds={likedIds} toggleLike={toggleLike} />} />
                        <Route path="/minddate" element={<CategoryPage categoryType="minddate" items={matchingList} headerInfo={categoryHeaders.minddate} detailImage={categoryDetailImages.minddate} badges={[{label: "전체", value: "all"}, {label: "모집중", value: "open"}, {label: "종료됨", value: "ended"}]} onItemClick={handleItemClick} likedIds={likedIds} toggleLike={toggleLike} />} />
                        <Route path="/crew" element={<CategoryPage categoryType="crew" items={crewList} headerInfo={categoryHeaders.crew} detailImage={categoryDetailImages.crew} badges={[{label: "크루 모집", value: "recruit"}, {label: "임장 리포트", value: "report"}]} onItemClick={handleItemClick} likedIds={likedIds} toggleLike={toggleLike} />} />
                        <Route path="/lecture" element={<CategoryPage categoryType="lecture" items={lectureList} headerInfo={categoryHeaders.lecture} detailImage={categoryDetailImages.lecture} badges={[{label: "전체", value: "all"}, {label: "온라인(VOD)", value: "VOD"}, {label: "오프라인", value: "오프라인"}]} onItemClick={handleItemClick} likedIds={likedIds} toggleLike={toggleLike} />} />
                        <Route path="/mypage" element={<MyPage likedIds={likedIds} appliedIds={appliedIds} unlockedIds={unlockedIds} onItemClick={handleItemClick} toggleLike={toggleLike} bannerImg={myPageBanner} currentUser={currentUser} commissionRate={commissionRate} onUpdateUser={handleUpdateUser} showToast={showToast} />} />
                    </Routes>
                </main>
                <Footer />
              </div>

              <BottomNav />
              
              {showScrollTop && (
                <button onClick={scrollToTop} className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-50 p-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-full shadow-xl hover:bg-slate-700 dark:hover:bg-indigo-500 transition-all hover:scale-110 active:scale-90 animate-in fade-in zoom-in duration-300">
                  <ArrowUp size={24} />
                </button>
              )}

              {selectedItem && (
                <Modal 
                  item={selectedItem} 
                  onClose={closeItemModal} 
                  isLiked={likedIds.includes(selectedItem.id)}
                  toggleLike={() => toggleLike(selectedItem.id)}
                  isApplied={appliedIds.includes(selectedItem.id)}
                  isUnlocked={unlockedIds.includes(selectedItem.id)}
                  onApply={handleApply}
                  onUnlock={handleUnlock}
                  showToast={showToast}
                />
              )}

              {isLoginOpen && (
                 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsLoginOpen(false)}></div>
                  <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                      <button onClick={() => setIsLoginOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
                      <div className="text-center mb-8">
                          <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-4 text-white dark:text-slate-900 font-bold text-xl">임</div>
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">로그인</h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">나와 같은 방향을 걷는 사람들을 만나는 곳</p>
                      </div>
                      <div className="space-y-3">
                          <button onClick={() => handleLogin('kakao')} className="w-full py-3.5 px-4 bg-[#FEE500] hover:bg-[#FDD835] text-[#3c1e1e] font-medium rounded-xl flex items-center justify-center gap-2 transition-colors relative">
                              <span className="absolute left-4"><KakaoIcon /></span>
                              카카오로 계속하기
                          </button>
                          <button onClick={() => handleLogin('naver')} className="w-full py-3.5 px-4 bg-[#03C75A] hover:bg-[#02b351] text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors relative">
                              <span className="absolute left-4"><NaverIcon /></span>
                              네이버로 계속하기
                          </button>
                          <button onClick={() => handleLogin('google')} className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors relative">
                              <span className="absolute left-4"><GoogleIcon /></span>
                              Google로 계속하기
                          </button>
                      </div>
                  </div>
                 </div>
              )}
            </div>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
