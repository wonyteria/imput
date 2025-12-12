
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Modal from './components/Modal';
import Toast from './components/Toast'; // Import Toast
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import { networkingList, matchingList, crewList, lectureList, slides as initialSlides } from './constants';
import { AnyItem, User, Slide } from './types';
import { X, ArrowUp } from 'lucide-react';

const App: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<AnyItem | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // --- Global State Management ---
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);

  // --- Scroll To Top State ---
  const [showScrollTop, setShowScrollTop] = useState(false);

  // --- Toast State ---
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => setToast(null);

  // --- Home & Design Settings State (Lifted Up) ---
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [brandTagline, setBrandTagline] = useState("나와 같은 방향을 걷는 사람들을 만나는 곳, 임풋");
  const [globalFont, setGlobalFont] = useState('Pretendard'); // Default Font
  const [notifications, setNotifications] = useState<string[]>([
    "🔥 [마감임박] 강남 청약 스터디 2자리 남았습니다!",
    "💘 [매칭] 방금 '30대 직장인 소개팅' 남성 1명 신청완료",
    "👟 [모집] 마포구 임장 크루 리더가 코스를 업데이트했습니다.",
    "🎓 [신규] '2025 부동산 전망' VOD가 업로드 되었습니다."
  ]);

  // Default Category Banners
  const [categoryBanners, setCategoryBanners] = useState({
      networking: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1600",
      minddate: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=1600",
      crew: "https://images.unsplash.com/photo-1475721027767-4d563518e5c7?auto=format&fit=crop&q=80&w=1600",
      lecture: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1600",
      mypage: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=1600"
  });

  // Apply Font Dynamically
  useEffect(() => {
    const fontMap: {[key: string]: string} = {
        'Pretendard': '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
        'Gmarket Sans': '"GmarketSans", sans-serif',
        'Noto Sans KR': '"Noto Sans KR", sans-serif'
    };
    document.body.style.fontFamily = fontMap[globalFont] || fontMap['Pretendard'];
  }, [globalFont]);

  // Scroll Event Listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
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

  const toggleLike = (id: number) => {
    const isLiked = likedIds.includes(id);
    setLikedIds(prev => isLiked ? prev.filter(itemId => itemId !== id) : [...prev, id]);
    
    // Toast Feedback
    if (!isLiked) {
        showToast("관심 목록에 추가되었습니다!", "success");
    } else {
        showToast("관심 목록에서 삭제되었습니다.", "info");
    }
  };

  const handleApply = (id: number) => {
    if (!appliedIds.includes(id)) {
      setAppliedIds(prev => [...prev, id]);
      showToast("신청이 완료되었습니다! 마이페이지에서 확인하세요.", "success");
    }
  };

  const handleUnlock = (id: number) => {
    if (!unlockedIds.includes(id)) {
      setUnlockedIds(prev => [...prev, id]);
      showToast("리포트가 잠금 해제되었습니다.", "success");
    }
  };

  // Mock Login Function
  const handleLogin = (provider: string) => {
      if (provider === 'kakao') {
          const mockAdmin: User = {
              id: 1,
              name: '김관리(Admin)',
              email: 'admin@imfoot.com',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
              roles: ['super_admin'],
              joinDate: '2023-01-01'
          };
          setCurrentUser(mockAdmin);
          showToast("관리자 계정으로 로그인되었습니다.", "success");
      } else {
          const mockUser: User = {
              id: 99,
              name: '일반유저',
              email: 'user@imfoot.com',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
              roles: [],
              joinDate: '2024-01-01'
          };
          setCurrentUser(mockUser);
          showToast("성공적으로 로그인되었습니다.", "success");
      }
      setIsLoginOpen(false);
  };

  return (
    <HashRouter>
      {/* Global Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <Routes>
        {/* Admin Route - Separate Layout */}
        <Route 
          path="/admin" 
          element={
            <AdminPage 
                globalSlides={slides} 
                setGlobalSlides={setSlides}
                globalNotis={notifications}
                setGlobalNotis={setNotifications}
                categoryBanners={categoryBanners}
                setCategoryBanners={setCategoryBanners}
                brandTagline={brandTagline}
                setBrandTagline={setBrandTagline}
                globalFont={globalFont}
                setGlobalFont={setGlobalFont}
                showToast={showToast} // Pass Toast
            />
          } 
        />

        {/* User Routes - Main Layout */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
              {/* Desktop Sidebar */}
              <div className="hidden lg:block">
                  <Sidebar 
                    onLoginClick={() => setIsLoginOpen(true)} 
                    currentUser={currentUser}
                    showToast={showToast}
                  />
              </div>

              {/* Main Content Area */}
              <div className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-300 w-full max-w-[100vw] overflow-x-hidden">
                <main className="flex-1 p-4 md:p-6 lg:p-10 pb-24 lg:pb-10 relative">
                    {/* Mobile Header (Simple Logo) */}
                    <div className="lg:hidden flex items-center justify-between mb-6 pt-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                                <span className="text-white font-extrabold text-sm">임</span>
                            </div>
                            <span className="font-extrabold text-xl text-slate-900">임풋</span>
                        </div>
                        {currentUser ? (
                            <div className="flex items-center gap-2">
                                <img src={currentUser.avatar} className="w-8 h-8 rounded-full border border-slate-200" alt="profile"/>
                            </div>
                        ) : (
                            <button onClick={() => setIsLoginOpen(true)} className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                                로그인
                            </button>
                        )}
                    </div>

                    <Routes>
                        <Route 
                            path="/" 
                            element={
                            <Home 
                                onItemClick={handleItemClick} 
                                likedIds={likedIds}
                                toggleLike={toggleLike}
                                slides={slides}
                                notifications={notifications}
                                brandTagline={brandTagline}
                            />
                            } 
                        />
                        
                        <Route 
                            path="/networking" 
                            element={
                            <CategoryPage 
                                categoryType="networking"
                                items={networkingList}
                                bannerImg={categoryBanners.networking}
                                badges={[
                                {label: "전체", value: "all"}, 
                                {label: "모집중", value: "open"}, 
                                {label: "종료됨", value: "ended"}
                                ]}
                                onItemClick={handleItemClick}
                                likedIds={likedIds}
                                toggleLike={toggleLike}
                            />
                            } 
                        />

                        <Route 
                            path="/minddate" 
                            element={
                            <CategoryPage 
                                categoryType="minddate"
                                items={matchingList}
                                bannerImg={categoryBanners.minddate}
                                badges={[
                                {label: "전체", value: "all"}, 
                                {label: "모집중", value: "open"}, 
                                {label: "종료됨", value: "ended"}
                                ]}
                                onItemClick={handleItemClick}
                                likedIds={likedIds}
                                toggleLike={toggleLike}
                            />
                            } 
                        />

                        <Route 
                            path="/crew" 
                            element={
                            <CategoryPage 
                                categoryType="crew"
                                items={crewList}
                                bannerImg={categoryBanners.crew}
                                badges={[
                                {label: "크루 모집", value: "recruit"}, 
                                {label: "임장 리포트", value: "report"}
                                ]}
                                onItemClick={handleItemClick}
                                likedIds={likedIds}
                                toggleLike={toggleLike}
                            />
                            } 
                        />

                        <Route 
                            path="/lecture" 
                            element={
                            <CategoryPage 
                                categoryType="lecture"
                                items={lectureList}
                                bannerImg={categoryBanners.lecture}
                                badges={[
                                {label: "전체", value: "all"}, 
                                {label: "온라인(VOD)", value: "VOD"}, 
                                {label: "오프라인", value: "오프라인"}
                                ]}
                                onItemClick={handleItemClick}
                                likedIds={likedIds}
                                toggleLike={toggleLike}
                            />
                            } 
                        />

                        <Route 
                            path="/mypage"
                            element={
                            <MyPage 
                                likedIds={likedIds}
                                appliedIds={appliedIds}
                                unlockedIds={unlockedIds}
                                onItemClick={handleItemClick}
                                toggleLike={toggleLike}
                                bannerImg={categoryBanners.mypage}
                                currentUser={currentUser}
                            />
                            }
                        />
                    </Routes>
                </main>
                
                {/* Global Footer */}
                <Footer />
              </div>

              {/* Mobile Bottom Nav */}
              <BottomNav />
              
              {/* Scroll To Top Button */}
              {showScrollTop && (
                <button 
                  onClick={scrollToTop}
                  className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-50 p-3 bg-slate-900 text-white rounded-full shadow-xl hover:bg-slate-700 transition-all hover:scale-110 active:scale-90 animate-in fade-in zoom-in duration-300"
                >
                  <ArrowUp size={24} />
                </button>
              )}

              {/* Detail Modal */}
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

              {/* Login Modal */}
              {isLoginOpen && (
                 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsLoginOpen(false)}></div>
                  <div className="relative bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                      <button 
                          onClick={() => setIsLoginOpen(false)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                      >
                          <X size={20} />
                      </button>
                      
                      <div className="text-center mb-8">
                          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">임</div>
                          <h2 className="text-xl font-bold text-slate-900">로그인</h2>
                          <p className="text-sm text-slate-500 mt-1">임풋에 오신 것을 환영합니다</p>
                      </div>

                      <div className="space-y-4">
                          <button 
                            onClick={() => handleLogin('kakao')}
                            className="w-full py-3 px-4 bg-[#FEE500] hover:bg-[#FDD835] text-[#3c1e1e] font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                          >
                              <span className="font-bold">Kakao</span> (관리자로 로그인 예시)
                          </button>
                          <button 
                             onClick={() => handleLogin('apple')}
                             className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                          >
                              <span className="font-bold">Apple</span> (일반 유저 로그인 예시)
                          </button>
                          <button className="w-full py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors">
                              이메일로 계속하기
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
