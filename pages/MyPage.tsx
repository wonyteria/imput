
import React, { useState, useRef } from 'react';
import { AnyItem, User } from '../types';
import Card from '../components/Card';
import { networkingList, matchingList, crewList, lectureList } from '../constants';
import { Trophy, Heart, FolderOpen, Briefcase, DollarSign, Wallet, Percent, CheckCircle2, Plus, Calendar, MapPin, X, ArrowRight, UserPlus, FileText, BadgeCheck, Image as ImageIcon, Trash2, PlusCircle, ChevronDown, ChevronUp, Clock, Crown, Zap, CreditCard, AlertTriangle, MessageCircle, AlertCircle, Lock, Smile, Star, PenTool } from 'lucide-react';

interface MyPageProps {
  likedIds: number[];
  appliedIds: number[];
  unlockedIds: number[]; 
  onItemClick: (item: AnyItem) => void;
  toggleLike: (id: number) => void;
  bannerImg?: string;
  currentUser: User | null;
  commissionRate: number;
  onUpdateUser: (user: User) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const MyPage: React.FC<MyPageProps> = ({ 
    likedIds, appliedIds, unlockedIds, onItemClick, toggleLike, 
    bannerImg, currentUser, commissionRate, onUpdateUser, showToast 
}) => {
  const [activeTab, setActiveTab] = useState<'liked' | 'applied' | 'partner'>('liked');
  
  // --- Data Logic ---
  const allItems = [...networkingList, ...matchingList, ...crewList, ...lectureList];
  const likedItems = allItems.filter(item => likedIds.includes(item.id));
  const myLibraryItems = allItems.filter(item => appliedIds.includes(item.id) || unlockedIds.includes(item.id));

  // --- Partner State ---
  const [isApplying, setIsApplying] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [showLevelBenefits, setShowLevelBenefits] = useState(false);

  // --- Review State ---
  const [reviewingItem, setReviewingItem] = useState<AnyItem | null>(null);
  const [reviewedIds, setReviewedIds] = useState<number[]>([]); // Mock DB for reviewed items

  // Mock Data with Settlement Status
  // settlementStatus: 'pending' (미정산/미납), 'settled' (정산완료/납부완료)
  const [myCreatedItems, setMyCreatedItems] = useState<any[]>([
      { 
        id: 901, categoryType: 'crew', type: "recruit", title: "[내가 만든 모임] 강남 하이엔드 임장", status: 'ended', 
        date: "2024.01.10", price: "50,000원", sales: 20, revenue: 1000000, img: "https://images.unsplash.com/photo-1475721027767-4d563518e5c7?w=800",
        settlementStatus: 'pending' // 테스트를 위해 '미납' 상태로 설정 (Blocking Logic Trigger)
      },
      { 
        id: 902, categoryType: 'networking', type: "study", title: "[내가 만든 스터디] 부동산 세금 기초", status: 'open', 
        date: "2024.02.05", price: "30,000원", sales: 12, revenue: 360000, img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
        settlementStatus: 'pending' // 진행 중인 모임은 정산 대기
      }
  ]);

  // --- Gamification Logic (Updated with Review XP) ---
  const reviewXP = reviewedIds.length * 30; // 30 XP per review
  const totalXP = (likedIds.length * 10) + ((appliedIds.length + unlockedIds.length) * 50) + reviewXP;
  
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

  // --- Helpers ---
  const hasPartnerRole = currentUser && currentUser.roles.some(r => r.includes('manager') || r === 'super_admin');
  
  // --- Settlement Logic Updated ---
  const calculateSettlement = () => {
      let totalSales = 0;
      let totalFees = 0;
      let netProfit = 0;
      let feesToPay = 0; // Host -> Platform (Unpaid Bills)
      let payoutToReceive = 0; // Platform -> Host (Unpaid Payouts)
      let blockedByFee = false; // Flag to block creation

      myCreatedItems.forEach(item => {
          totalSales += item.revenue;
          const fee = Math.floor(item.revenue * (commissionRate / 100));
          totalFees += fee;
          netProfit += (item.revenue - fee);

          // Logic for Fees to Pay (Direct Payment Items)
          if (item.categoryType !== 'minddate') {
              if (item.status === 'ended' && item.settlementStatus === 'pending') {
                  feesToPay += fee;
                  blockedByFee = true; // Found an ended item that is not settled
              }
          }
          // Logic for Payout to Receive (Platform Payment Items)
          else {
              if (item.status === 'ended' && item.settlementStatus === 'pending') {
                  payoutToReceive += (item.revenue - fee);
              }
          }
      });

      return { totalSales, totalFees, netProfit, feesToPay, payoutToReceive, blockedByFee };
  };

  const { totalSales, netProfit, feesToPay, payoutToReceive, blockedByFee } = calculateSettlement();

  const handleCreateClick = () => {
      if (blockedByFee) {
          showToast("미납된 수수료가 있습니다. 정산 후 콘텐츠 개설이 가능합니다.", "error");
          return;
      }
      setIsCreating(true);
  };

  const handleReviewSubmit = (id: number) => {
      setReviewedIds(prev => [...prev, id]);
      setReviewingItem(null);
      showToast("소중한 후기가 등록되었습니다! 경험치 +30 XP", "success");
  };

  // --- Review Write Modal ---
  const ReviewWriteModal = ({ item, onClose, onSubmit }: { item: AnyItem, onClose: () => void, onSubmit: (id: number) => void }) => {
      const [rating, setRating] = useState(5);
      const [text, setText] = useState("");

      return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                  <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20}/></button>
                  
                  <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">모임은 만족스러우셨나요?</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-ellipsis line-clamp-1 px-4">
                          '{item.title}'
                      </p>
                  </div>

                  <div className="flex justify-center gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star} 
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110 active:scale-95"
                          >
                              <Star 
                                size={32} 
                                className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} 
                              />
                          </button>
                      ))}
                  </div>

                  <div className="mb-6">
                      <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="좋았던 점, 아쉬웠던 점을 솔직하게 남겨주세요."
                        className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white text-sm"
                      />
                  </div>

                  <button 
                    onClick={() => {
                        if (text.length < 5) {
                            showToast("후기 내용은 최소 5자 이상 입력해주세요.", "error");
                            return;
                        }
                        onSubmit(item.id);
                    }}
                    className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
                  >
                      후기 등록하기 (+30 XP)
                  </button>
              </div>
          </div>
      );
  };

  // --- Modal Components (Partner & Create Content) ---
  // ... (PartnerApplicationModal remains unchanged) ...
  const PartnerApplicationModal = () => (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsApplying(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
              <button onClick={() => setIsApplying(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20}/></button>
              <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                      <UserPlus size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">파트너(호스트) 신청</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">임풋과 함께 성장할 파트너님을 모십니다.</p>
              </div>
              
              <div className="space-y-4 mb-6">
                  <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">지원 분야</label>
                      <select 
                        value={selectedRole} 
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                          <option value="" disabled>분야를 선택해주세요</option>
                          <option value="crew_manager">임장 크루 리더</option>
                          <option value="networking_manager">스터디/모임장</option>
                          <option value="lecture_manager">재테크 강사</option>
                          <option value="minddate_manager">매칭 매니저</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">간단 소개 및 경력</label>
                      <textarea 
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                        placeholder="관련 경험이나 활동 계획을 적어주세요."
                      />
                  </div>
              </div>

              <button 
                onClick={() => {
                    if(!selectedRole) {
                        showToast("지원 분야를 선택해주세요.", "error");
                        return;
                    }
                    if(currentUser) {
                        // Mock Approval Logic
                        const updatedUser = { ...currentUser, roles: [...currentUser.roles, selectedRole] };
                        onUpdateUser(updatedUser);
                        showToast("🎉 축하합니다! 파트너 승인이 완료되었습니다.", "success");
                        setIsApplying(false);
                    }
                }}
                className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
              >
                  신청서 제출하기
              </button>
          </div>
      </div>
  );

  const CreateContentModal = () => {
      // ... (Content stays same as previous update)
      // Form State
      const [category, setCategory] = useState<'crew' | 'networking' | 'lecture' | 'minddate'>('crew');
      const [title, setTitle] = useState('');
      const [desc, setDesc] = useState('');
      const [imgPreview, setImgPreview] = useState<string>('');
      const [hostBankAccount, setHostBankAccount] = useState('');
      const [kakaoLink, setKakaoLink] = useState('');
      const [agreedToFee, setAgreedToFee] = useState(false);
      
      // Host Info State
      const [hostDesc, setHostDesc] = useState('');
      const [hostImgPreview, setHostImgPreview] = useState<string>('');
      
      // Price State
      const [priceRaw, setPriceRaw] = useState('');

      // Date State
      const [selectedDate, setSelectedDate] = useState('');
      const [selectedTime, setSelectedTime] = useState('');

      // Location State (Default Value)
      const [loc, setLoc] = useState('[라임스퀘어] 서울특별시 강남구 역삼로5길 5 지하1층');

      // Category Specific States
      const [dynamicList, setDynamicList] = useState<string[]>(['']); 
      const [level, setLevel] = useState('입문'); 
      const [maxMembers, setMaxMembers] = useState(8); 
      const [netType, setNetType] = useState('study'); 
      const [lecFormat, setLecFormat] = useState('VOD'); 
      const [genderRatio, setGenderRatio] = useState({ male: 5, female: 5 }); 

      const fileInputRef = useRef<HTMLInputElement>(null);
      const hostFileRef = useRef<HTMLInputElement>(null);

      // --- Handlers ---
      const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (val: string) => void) => {
          const file = e.target.files?.[0];
          if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                  setPreview(reader.result as string);
              };
              reader.readAsDataURL(file);
          }
      };

      const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          // Allow only numbers
          const val = e.target.value.replace(/[^0-9]/g, '');
          setPriceRaw(val);
      };

      const formatPriceDisplay = (val: string) => {
          if(!val) return '';
          return Number(val).toLocaleString();
      };

      const handleListChange = (index: number, value: string) => {
          const newList = [...dynamicList];
          newList[index] = value;
          setDynamicList(newList);
      };

      const addListItem = () => setDynamicList([...dynamicList, '']);
      const removeListItem = (index: number) => setDynamicList(dynamicList.filter((_, i) => i !== index));

      const getDynamicListLabel = () => {
          switch(category) {
              case 'crew': return '임장 코스 (Step별 입력)';
              case 'networking': return '스터디 커리큘럼 / 모임 식순';
              case 'lecture': return '강의 커리큘럼';
              case 'minddate': return '참가 대상 (Target)';
              default: return '목록';
          }
      };

      const formatDisplayDate = (d: string, t: string) => {
          if (!d) return '날짜 미정';
          const dateObj = new Date(d);
          const month = dateObj.getMonth() + 1;
          const day = dateObj.getDate();
          const dayName = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];
          return `${month}.${day}(${dayName}) ${t}`;
      };

      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCreating(false)}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="text-emerald-500"/> 콘텐츠 만들기
                    </h3>
                    <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* 1. Category Selection */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">카테고리 선택</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { id: 'crew', label: '임장 크루' }, 
                                { id: 'networking', label: '네트워킹' }, 
                                { id: 'lecture', label: '강의' }, 
                                { id: 'minddate', label: '마인드데이트' }
                            ].map((cat) => (
                                <button 
                                    key={cat.id}
                                    onClick={() => {
                                        setCategory(cat.id as any);
                                        setDynamicList(['']); // Reset list
                                    }}
                                    className={`py-2 rounded-lg text-sm font-bold transition-all ${category === cat.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Image Upload */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">대표 이미지 (썸네일)</label>
                        <div 
                            className="w-full h-48 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors overflow-hidden group relative"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imgPreview ? (
                                <>
                                    <img src={imgPreview} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white font-bold text-sm flex items-center gap-2"><ImageIcon size={16}/> 이미지 변경</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="text-slate-400 mb-2" size={32} />
                                    <p className="text-sm text-slate-500 font-medium">클릭하여 이미지 업로드</p>
                                    <p className="text-xs text-slate-400 mt-1">권장 사이즈: 1200 x 800px</p>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setImgPreview)} />
                        </div>
                    </div>

                    {/* 3. Host Info (New Section) */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 space-y-4">
                        <h4 className="font-bold text-indigo-800 dark:text-indigo-200 text-sm flex items-center gap-2">
                            <Smile size={16}/> 호스트 소개 설정 (필수)
                        </h4>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">호스트 소개글</label>
                            <textarea 
                                value={hostDesc} 
                                onChange={(e) => setHostDesc(e.target.value)} 
                                rows={3} 
                                placeholder="참여자들에게 나를 소개해보세요. (경력, 진행 스타일 등)" 
                                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">호스트 소개 이미지 (선택)</label>
                            <div className="flex items-center gap-4">
                                <div 
                                    className="w-16 h-16 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center cursor-pointer overflow-hidden relative group"
                                    onClick={() => hostFileRef.current?.click()}
                                >
                                    {hostImgPreview ? (
                                        <img src={hostImgPreview} alt="Host" className="w-full h-full object-cover" />
                                    ) : (
                                        <Plus size={20} className="text-slate-400" />
                                    )}
                                    <input ref={hostFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setHostImgPreview)} />
                                </div>
                                <p className="text-xs text-slate-400">프로필 사진이나<br/>활동 사진을 올려주세요.</p>
                            </div>
                        </div>
                    </div>

                    {/* 4. Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">제목</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="매력적인 제목을 입력해주세요" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">상세 설명</label>
                            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="모임에 대한 자세한 설명을 적어주세요." className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"/>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Price Input (Formatted) */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">가격</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={formatPriceDisplay(priceRaw)} 
                                        onChange={handlePriceChange} 
                                        placeholder="0" 
                                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-right pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold text-sm">원</span>
                                </div>
                            </div>
                            
                            {/* Date & Time Picker */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">날짜/시간</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input 
                                            type="date" 
                                            value={selectedDate} 
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="w-full pl-3 pr-2 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="relative w-1/3">
                                        <input 
                                            type="time" 
                                            value={selectedTime}
                                            onChange={(e) => setSelectedTime(e.target.value)}
                                            className="w-full px-2 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Input */}
                        <div>
                             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">장소</label>
                             <div className="relative">
                                <input 
                                    type="text" 
                                    value={loc} 
                                    onChange={(e) => setLoc(e.target.value)} 
                                    placeholder="장소를 입력하세요" 
                                    className="w-full pl-10 px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                             </div>
                        </div>

                        {/* Host Info: Bank & Kakao (For Non-MindDate) */}
                        {category !== 'minddate' && (
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">입금 받을 계좌번호 (본인 명의)</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={hostBankAccount} 
                                            onChange={(e) => setHostBankAccount(e.target.value)} 
                                            placeholder="예) 카카오뱅크 3333-01-2345678 홍길동" 
                                            className="w-full pl-10 px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">참여자들에게 노출되는 입금 계좌입니다. 정확하게 입력해주세요.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">문의용 카카오톡 오픈채팅방 링크 (선택)</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={kakaoLink} 
                                            onChange={(e) => setKakaoLink(e.target.value)} 
                                            placeholder="https://open.kakao.com/..." 
                                            className="w-full pl-10 px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">신청자가 문의할 수 있는 1:1 채팅방 링크를 입력하면 신뢰도가 올라갑니다.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 5. Category Specific Fields */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-4">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                            {category === 'crew' && <MapPin size={16}/>}
                            {category === 'networking' && <Briefcase size={16}/>}
                            {category === 'lecture' && <Briefcase size={16}/>}
                            {category === 'minddate' && <Heart size={16}/>}
                            {category === 'crew' ? '임장 상세 설정' : category === 'networking' ? '네트워킹 상세 설정' : category === 'lecture' ? '강의 상세 설정' : '매칭 상세 설정'}
                        </h4>

                        {category === 'crew' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">난이도</label>
                                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm">
                                    <option value="입문">입문 (초보 추천)</option>
                                    <option value="중급">중급</option>
                                    <option value="실전">실전 (고수 추천)</option>
                                </select>
                            </div>
                        )}

                        {category === 'networking' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">모임 유형</label>
                                    <select value={netType} onChange={(e) => setNetType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm">
                                        <option value="study">스터디</option>
                                        <option value="social">친목/소셜</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">최대 인원</label>
                                    <input type="number" value={maxMembers} onChange={(e) => setMaxMembers(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
                                </div>
                            </div>
                        )}

                        {category === 'lecture' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">강의 형태</label>
                                <select value={lecFormat} onChange={(e) => setLecFormat(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm">
                                    <option value="VOD">온라인 (VOD)</option>
                                    <option value="오프라인">오프라인</option>
                                </select>
                            </div>
                        )}

                        {category === 'minddate' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">모집 성비 (남/여)</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" value={genderRatio.male} onChange={(e) => setGenderRatio({...genderRatio, male: parseInt(e.target.value)})} className="w-20 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-center" placeholder="남"/>
                                    <span className="text-slate-400">:</span>
                                    <input type="number" value={genderRatio.female} onChange={(e) => setGenderRatio({...genderRatio, female: parseInt(e.target.value)})} className="w-20 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-center" placeholder="여"/>
                                </div>
                            </div>
                        )}

                        {/* Dynamic List Input (Course / Curriculum / Targets) */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">{getDynamicListLabel()}</label>
                            <div className="space-y-2">
                                {dynamicList.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <div className="flex-1 relative">
                                            {category === 'crew' && <div className="absolute left-3 top-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                                            <input 
                                                type="text" 
                                                value={item} 
                                                onChange={(e) => handleListChange(index, e.target.value)}
                                                className={`w-full ${category === 'crew' ? 'pl-7' : 'pl-3'} pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-1 focus:ring-indigo-500 outline-none`}
                                                placeholder={category === 'crew' ? `코스 ${index + 1}` : '내용을 입력하세요'}
                                            />
                                        </div>
                                        {dynamicList.length > 1 && (
                                            <button onClick={() => removeListItem(index)} className="text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={addListItem} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline mt-1">
                                    <PlusCircle size={14}/> 항목 추가
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Fee Notice & Agreement (Only for Direct Payment) */}
                    {category !== 'minddate' && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                            <h4 className="font-bold text-orange-800 dark:text-orange-200 text-sm flex items-center gap-2 mb-2">
                                <AlertTriangle size={16}/> 정산 및 수수료 안내 (필독)
                            </h4>
                            <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed mb-3">
                                본 콘텐츠의 참가비는 <b>호스트님 계좌로 직접 입금</b>됩니다.<br/>
                                플랫폼 수수료({commissionRate}%)는 매월 말일 정산서가 발행되어 청구되오니, 이에 동의하셔야 개설이 가능합니다.
                            </p>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={agreedToFee} 
                                    onChange={(e) => setAgreedToFee(e.target.checked)}
                                    className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                                />
                                <span className="text-xs font-bold text-orange-900 dark:text-orange-100">위 내용을 확인하였으며, 수수료 후불 정산에 동의합니다.</span>
                            </label>
                        </div>
                    )}

                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3">
                    <button onClick={() => setIsCreating(false)} className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">취소</button>
                    <button 
                        onClick={() => {
                            if(!title) { showToast("제목을 입력해주세요", "error"); return; }
                            if(!hostDesc) { showToast("호스트 소개글을 입력해주세요", "error"); return; }
                            if(!priceRaw) { showToast("가격을 입력해주세요", "error"); return; }
                            if(!selectedDate) { showToast("날짜를 선택해주세요", "error"); return; }
                            if(category !== 'minddate') {
                                if(!hostBankAccount) { showToast("입금 받을 계좌번호를 입력해주세요", "error"); return; }
                                if(!agreedToFee) { showToast("정산 및 수수료 안내에 동의해주세요", "error"); return; }
                            }
                            
                            // Mock Item Creation
                            const newItem = {
                                id: Date.now(),
                                categoryType: category,
                                title: title,
                                desc: desc,
                                img: imgPreview || "https://images.unsplash.com/photo-1557683316-973673baf926?w=800", // Fallback image
                                status: 'open',
                                date: formatDisplayDate(selectedDate, selectedTime),
                                price: `${formatPriceDisplay(priceRaw)}원`,
                                loc: loc,
                                author: currentUser?.name || '익명',
                                hostBankInfo: hostBankAccount, // Save Host Bank Info
                                kakaoChatUrl: kakaoLink, // Save Kakao Link
                                hostDescription: hostDesc, // Save Host Desc
                                hostIntroImage: hostImgPreview, // Save Host Image
                                sales: 0,
                                revenue: 0,
                                settlementStatus: 'pending', // Default
                                // Specific fields
                                level: category === 'crew' ? level : undefined,
                                course: category === 'crew' ? dynamicList.filter(i => i) : undefined,
                                curriculum: (category === 'networking' || category === 'lecture') ? dynamicList.filter(i => i) : undefined,
                                type: category === 'networking' ? netType : category === 'crew' ? 'recruit' : undefined,
                                format: category === 'lecture' ? lecFormat : undefined,
                                currentParticipants: 0,
                                maxParticipants: category === 'networking' ? maxMembers : undefined,
                                target: category === 'minddate' ? dynamicList.filter(i => i) : undefined,
                                genderRatio: category === 'minddate' ? genderRatio : undefined,
                            };

                            setMyCreatedItems(prev => [newItem, ...prev]);
                            showToast("콘텐츠가 성공적으로 등록되었습니다!", "success");
                            setIsCreating(false);
                        }}
                        className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
                    >
                        등록하기
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- Level Benefit Popup ---
  // ... (LevelBenefitModal remains unchanged) ...
  const LevelBenefitModal = () => (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLevelBenefits(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-0 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white text-center relative">
                  <button onClick={() => setShowLevelBenefits(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"><X size={24}/></button>
                  <Trophy size={48} className="mx-auto mb-3 text-yellow-300 drop-shadow-lg" />
                  <h3 className="text-2xl font-black mb-1">멤버십 등급 혜택</h3>
                  <p className="text-indigo-100 text-sm">활동할수록 더 커지는 임풋의 혜택을 확인하세요.</p>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className={`p-4 rounded-xl border-2 ${level >= 1 ? 'border-indigo-100 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-slate-100'}`}>
                      <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">🐣</span>
                          <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">Lv.1 임린이</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">가입 즉시 적용</p>
                          </div>
                          {level === 1 && <span className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">현재 등급</span>}
                      </div>
                      <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                          <li>임장 리포트 열람 가능</li>
                          <li>커뮤니티 댓글 작성 권한</li>
                      </ul>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${level >= 2 ? 'border-indigo-100 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-slate-100 grayscale opacity-70'}`}>
                      <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">👣</span>
                          <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">Lv.2 임대장</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">누적 경험치 300XP 이상</p>
                          </div>
                          {level === 2 && <span className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">현재 등급</span>}
                      </div>
                      <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                          <li><span className="font-bold text-indigo-600">유료 강의 5% 상시 할인</span></li>
                          <li>닉네임 옆 '임대장' 뱃지 부여</li>
                          <li>비공개 네트워킹 참여 기회</li>
                      </ul>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${level >= 3 ? 'border-indigo-100 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-slate-100 grayscale opacity-70'}`}>
                      <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">👑</span>
                          <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">Lv.3 부동산 고수</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">누적 경험치 1,000XP 이상</p>
                          </div>
                          {level === 3 && <span className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">현재 등급</span>}
                      </div>
                      <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                          <li><span className="font-bold text-indigo-600">모든 콘텐츠 10% 할인</span></li>
                          <li>파트너(호스트) 신청 시 우선 심사</li>
                          <li>VIP 오프라인 파티 초대</li>
                      </ul>
                  </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 dark:bg-slate-800 text-center text-xs text-slate-500">
                  경험치는 모임 신청(+50), 찜하기(+10), 리포트 구매(+50), 후기 작성(+30) 활동으로 적립됩니다.
              </div>
          </div>
      </div>
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Banner */}
      <div className="rounded-3xl mb-8 shadow-lg relative overflow-hidden group h-[200px]">
        <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: `url(${bannerImg || 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=1600'})` }}
        ></div>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">마이페이지</h1>
            <p className="text-slate-200">나의 성장 기록과 파트너(호스트) 활동 내역을 확인하세요.</p>
        </div>
      </div>
      
      {/* Profile & Gamification Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 relative -mt-16 mx-4 md:mx-0 z-20 overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center md:items-start md:text-left flex-shrink-0">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl shadow-inner border-4 border-white dark:border-slate-700 mb-3 relative">
                    {currentUser ? <img src={currentUser.avatar} className="w-full h-full rounded-full" /> : icon}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-md">
                        {level}
                    </div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentUser ? currentUser.name : '비회원'}</h2>
                <div className="flex flex-col items-center md:items-start">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{rankName} 단계</p>
                    {hasPartnerRole && (
                        <span className="mt-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-full flex items-center gap-1">
                            <BadgeCheck size={10}/> 파트너(호스트)
                        </span>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex-1 w-full">
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                        <p className="text-xs text-slate-400 mb-1">총 경험치</p>
                        <p className="text-lg font-black text-slate-800 dark:text-white">{totalXP} XP</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => setActiveTab('liked')}>
                        <p className="text-xs text-slate-400 mb-1">찜한 목록</p>
                        <p className="text-lg font-black text-pink-500">{likedItems.length}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => setActiveTab('applied')}>
                        <p className="text-xs text-slate-400 mb-1">내 서재</p>
                        <p className="text-lg font-black text-indigo-500 dark:text-indigo-400">{myLibraryItems.length}</p>
                    </div>
                </div>

                {/* Level Progress */}
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40">
                                <Trophy size={12} className="inline mr-1 mb-0.5"/> Level Up
                            </span>
                            <button onClick={() => setShowLevelBenefits(true)} className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 underline flex items-center gap-0.5">
                                <Zap size={10}/> 등급별 혜택 보기
                            </button>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-indigo-600 dark:text-indigo-400">
                                {nextRankName}까지 {maxXP - totalXP} XP 남음
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-3 mb-2 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800">
                        <div style={{ width: `${progressPercent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out relative">
                            {progressPercent > 5 && <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 animate-pulse"></div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 sticky top-0 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur z-20 pt-4 transition-colors duration-300">
        <button onClick={() => setActiveTab('liked')} className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'liked' ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
            찜한 목록
            {activeTab === 'liked' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white"></div>}
        </button>
        <button onClick={() => setActiveTab('applied')} className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'applied' ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
            내 서재 (신청/구매)
            {activeTab === 'applied' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white"></div>}
        </button>
        <button onClick={() => setActiveTab('partner')} className={`px-6 py-3 font-bold text-sm transition-colors relative flex items-center gap-1 ${activeTab === 'partner' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
            <Briefcase size={16}/> 파트너 센터
            {activeTab === 'partner' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400"></div>}
        </button>
      </div>

      {/* Content Grid */}
      <div className="min-h-[300px]">
        {activeTab === 'liked' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {likedItems.length > 0 ? (
                    likedItems.map((item, index) => (
                        <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 50}ms` }}>
                            <Card item={item} onClick={() => onItemClick(item)} isLiked={true} onToggleLike={() => toggleLike(item.id)} />
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center mb-4 text-pink-300 dark:text-pink-600">
                            <Heart size={32} />
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-bold text-lg mb-1">아직 찜한 모임이 없어요.</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm">관심 있는 모임에 하트를 눌러보세요!</p>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'applied' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myLibraryItems.length > 0 ? (
                    myLibraryItems.map((item, index) => {
                        const isReviewable = item.status === 'ended' || item.status === 'closed';
                        const hasReview = reviewedIds.includes(item.id);

                        return (
                            <div key={item.id} className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 50}ms` }}>
                                <Card item={item} onClick={() => onItemClick(item)} isLiked={likedIds.includes(item.id)} onToggleLike={() => toggleLike(item.id)} />
                                
                                {/* Review Button Section */}
                                {isReviewable && (
                                    <div className="mt-2">
                                        {hasReview ? (
                                            <div className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-default">
                                                <CheckCircle2 size={14}/> 후기 작성 완료
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setReviewingItem(item)}
                                                className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                            >
                                                <Star size={14} className="fill-white/80 text-transparent"/> 후기 쓰고 경험치 받기 (+30XP)
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4 text-indigo-300 dark:text-indigo-600">
                            <FolderOpen size={32} />
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-bold text-lg mb-1">내 서재가 비어있어요.</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm">모임을 신청하거나 리포트를 구매하면 여기에 보관됩니다.</p>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'partner' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {!currentUser ? (
                    <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center">
                        <Briefcase size={48} className="text-slate-300 mb-4" />
                        <p className="text-slate-600 dark:text-slate-300 font-bold">로그인이 필요한 서비스입니다.</p>
                        <p className="text-slate-400 text-sm mt-1">로그인 후 파트너(호스트) 기능을 이용해보세요.</p>
                    </div>
                ) : !hasPartnerRole ? (
                    // --- NON-PARTNER LANDING ---
                    <div className="space-y-8">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between shadow-xl">
                            <div className="mb-6 md:mb-0 text-center md:text-left">
                                <h3 className="text-2xl md:text-3xl font-black mb-3">당신의 지식과 경험을 수익화하세요</h3>
                                <p className="text-indigo-100 text-lg opacity-90 max-w-xl">
                                    임풋의 파트너가 되어 모임, 강의, 리포트를 발행하고<br className="hidden md:block"/>
                                    새로운 수익 파이프라인을 만들어보세요.
                                </p>
                            </div>
                            <button 
                                onClick={() => { setIsApplying(true); setSelectedRole(''); }}
                                className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg"
                            >
                                파트너 신청하기
                            </button>
                        </div>
                        
                        <div>
                             <h4 className="font-bold text-slate-800 dark:text-white text-xl mb-4">모집 분야</h4>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors cursor-pointer group" onClick={() => { setSelectedRole('crew_manager'); setIsApplying(true); }}>
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform"><MapPin size={24}/></div>
                                    <h5 className="font-bold text-lg text-slate-900 dark:text-white mb-2">임장 크루 리더</h5>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">자신만의 임장 코스를 기획하고 멤버들을 리딩합니다.</p>
                                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-4 inline-flex items-center gap-1">신청하기 <ArrowRight size={12}/></span>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer group" onClick={() => { setSelectedRole('lecture_manager'); setIsApplying(true); }}>
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform"><Briefcase size={24}/></div>
                                    <h5 className="font-bold text-lg text-slate-900 dark:text-white mb-2">재테크 강사</h5>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">온/오프라인 강의를 통해 전문 지식을 공유합니다.</p>
                                    <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold mt-4 inline-flex items-center gap-1">신청하기 <ArrowRight size={12}/></span>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 transition-colors cursor-pointer group" onClick={() => { setSelectedRole('networking_manager'); setIsApplying(true); }}>
                                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-110 transition-transform"><FolderOpen size={24}/></div>
                                    <h5 className="font-bold text-lg text-slate-900 dark:text-white mb-2">모임장</h5>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">스터디나 네트워킹 모임을 주최하고 운영합니다.</p>
                                    <span className="text-amber-600 dark:text-amber-400 text-xs font-bold mt-4 inline-flex items-center gap-1">신청하기 <ArrowRight size={12}/></span>
                                </div>
                             </div>
                        </div>
                    </div>
                ) : (
                    // --- PARTNER DASHBOARD ---
                    <>
                        {/* Revenue Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={80} className="text-slate-900 dark:text-white" /></div>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">총 판매 금액 (매출)</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">₩ {totalSales.toLocaleString()}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={80} className="text-indigo-500" /></div>
                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2">내 예상 순수익 (매출-수수료)</p>
                                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₩ {netProfit.toLocaleString()}</p>
                            </div>
                            
                            {/* Settlement Status Card (Dynamic) */}
                            {feesToPay > 0 ? (
                                <div className="bg-gradient-to-br from-red-500 to-orange-600 p-6 rounded-2xl shadow-lg relative overflow-hidden text-white animate-pulse">
                                    <div className="absolute top-0 right-0 p-4 opacity-20"><FileText size={80} className="text-white" /></div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle size={18} className="text-yellow-300" />
                                        <p className="text-sm font-bold text-red-100">납부 필요 수수료</p>
                                    </div>
                                    <p className="text-3xl font-black tracking-tight">₩ {feesToPay.toLocaleString()}</p>
                                    <p className="text-[10px] text-white/90 mt-2 font-bold bg-black/20 inline-block px-2 py-1 rounded">
                                        * 수수료 납부 전까지 신규 개설이 제한됩니다.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg relative overflow-hidden text-white">
                                    <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet size={80} className="text-white" /></div>
                                    <p className="text-sm font-bold text-emerald-100 mb-2">정산 예정 금액 (지급)</p>
                                    <p className="text-3xl font-black tracking-tight">₩ {payoutToReceive.toLocaleString()}</p>
                                    <p className="text-[10px] text-white/70 mt-2">* 매월 10일 일괄 지급됩니다.</p>
                                </div>
                            )}
                        </div>

                        {/* My Content List */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">내가 만든 모임/콘텐츠</h3>
                                <button 
                                    onClick={handleCreateClick}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-1 ${blockedByFee ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'}`}
                                >
                                    {blockedByFee ? <Lock size={16}/> : <Plus size={16} />} 콘텐츠 만들기
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
                                            <th className="p-4 font-semibold">콘텐츠명</th>
                                            <th className="p-4 font-semibold">판매가</th>
                                            <th className="p-4 font-semibold text-right">판매수</th>
                                            <th className="p-4 font-semibold text-right">총 매출</th>
                                            <th className="p-4 font-semibold text-center">정산/청구 상태</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {myCreatedItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={item.img} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-700"/>
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{item.title}</p>
                                                            <p className="text-xs text-slate-400">{item.date} • {item.status === 'open' ? '모집중' : '종료'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{item.price}</td>
                                                <td className="p-4 text-right text-sm font-bold text-slate-900 dark:text-white">{item.sales}건</td>
                                                <td className="p-4 text-right text-sm font-bold text-slate-900 dark:text-white">₩ {item.revenue.toLocaleString()}</td>
                                                <td className="p-4 text-center">
                                                    {item.categoryType === 'minddate' ? (
                                                        // Platform Payment Item
                                                        item.status === 'ended' ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                                                <CheckCircle2 size={12}/> 지급 완료
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                                정산 대기
                                                            </span>
                                                        )
                                                    ) : (
                                                        // Direct Payment Item (Billable)
                                                        item.status === 'ended' ? (
                                                            item.settlementStatus === 'settled' ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                                                    <CheckCircle2 size={12}/> 납부 완료
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 animate-pulse">
                                                                    <AlertCircle size={12}/> 납부 요망
                                                                </span>
                                                            )
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                                진행중
                                                            </span>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )}

      </div>

      {isApplying && <PartnerApplicationModal />}
      {isCreating && <CreateContentModal />}
      {showLevelBenefits && <LevelBenefitModal />}
      {reviewingItem && <ReviewWriteModal item={reviewingItem} onClose={() => setReviewingItem(null)} onSubmit={handleReviewSubmit} />}
      
    </div>
  );
};

export default MyPage;
