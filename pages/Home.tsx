
import React, { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import Card from '../components/Card';
import { networkingList, matchingList, crewList, lectureList } from '../constants';
import { ChevronRight, Heart, Users, Map, Bell, Quote, Star, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnyItem, Review, Slide } from '../types';

interface HomeProps {
  onItemClick: (item: AnyItem) => void;
  likedIds: number[];
  toggleLike: (id: number) => void;
  slides: Slide[];
  notifications: string[];
  brandTagline: string;
}

const SectionHeader: React.FC<{ title: string; link: string; color?: string }> = ({ title, link, color = "text-slate-900" }) => (
  <div className="flex items-center justify-between mb-4 mt-2">
    <h3 className={`text-xl md:text-2xl font-bold ${color} tracking-tight`}>{title}</h3>
    <Link to={link} className="text-sm font-medium text-slate-400 hover:text-slate-800 flex items-center transition-colors">
      더보기 <ChevronRight size={16} />
    </Link>
  </div>
);

const Home: React.FC<HomeProps> = ({ onItemClick, likedIds, toggleLike, slides, notifications, brandTagline }) => {
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setInterval(() => {
        setTickerIndex(prev => (prev + 1) % notifications.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [notifications.length]);

  // Collect all items for reviews
  const allItems = [...networkingList, ...matchingList, ...crewList, ...lectureList];

  // Collect all reviews for the "Real Reviews" section
  const allReviews: {review: Review, itemTitle: string, type: string}[] = [];
  allItems.forEach(item => {
      if(item.reviews) {
          item.reviews.forEach(r => {
              allReviews.push({
                  review: r,
                  itemTitle: item.title,
                  type: item.categoryType
              });
          });
      }
  });
  // Shuffle or slice for display
  const displayReviews = allReviews.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      
        {/* Live Ticker (실시간 알림) */}
        {notifications.length > 0 && (
            <div className="bg-slate-900 text-white px-4 py-2.5 rounded-full mb-6 flex items-center gap-3 shadow-lg mx-1 overflow-hidden">
                <span className="bg-pink-500 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse flex-shrink-0">LIVE</span>
                <div className="flex-1 overflow-hidden relative h-5">
                    <p className="text-sm font-medium truncate absolute w-full transition-all duration-500" key={tickerIndex}>
                        {notifications[tickerIndex]}
                    </p>
                </div>
                <Bell size={14} className="text-slate-400" />
            </div>
        )}

        <HeroSlider slides={slides} />

        {/* Brand Tagline Section */}
        <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <h2 className="text-lg md:text-2xl font-medium text-slate-700 tracking-tight leading-relaxed font-serif italic">
                {brandTagline}
            </h2>
        </div>

        {/* Brand USP Section - Refined, Minimal Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* Card 1: MindDate */}
            <Link to="/minddate" className="group flex items-center gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-pink-100 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-150 fill-mode-backwards">
                <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform duration-300 border border-pink-100">
                    <Heart size={22} className="fill-pink-500" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-0.5 group-hover:text-pink-600 transition-colors">가치관 매칭</h4>
                    <p className="text-slate-500 text-sm font-medium">경제관이 통하는 소중한 인연</p>
                </div>
                <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-pink-400 transition-colors" size={20} />
            </Link>

            {/* Card 2: Crew */}
            <Link to="/crew" className="group flex items-center gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-300 fill-mode-backwards">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300 border border-emerald-100">
                    <Map size={22} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-0.5 group-hover:text-emerald-600 transition-colors">임장 크루</h4>
                    <p className="text-slate-500 text-sm font-medium">전문가와 함께 걷는 현장</p>
                </div>
                <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-emerald-500 transition-colors" size={20} />
            </Link>

            {/* Card 3: Networking */}
            <Link to="/networking" className="group flex items-center gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-500 fill-mode-backwards">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300 border border-indigo-100">
                    <Users size={22} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-0.5 group-hover:text-indigo-600 transition-colors">스터디 모임</h4>
                    <p className="text-slate-500 text-sm font-medium">함께 성장하는 오프라인 네트워킹</p>
                </div>
                <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-indigo-500 transition-colors" size={20} />
            </Link>
        </div>

        <div className="space-y-16">
            
            {/* 1. MindDate (Top Priority) */}
            <section>
            <SectionHeader title="💘 마인드데이트" link="/minddate" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {matchingList.slice(0, 4).map((item, index) => (
                    <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 100}ms` }}>
                        <Card item={item} onClick={() => onItemClick(item)} isLiked={likedIds.includes(item.id)} onToggleLike={() => toggleLike(item.id)} />
                    </div>
                    ))}
            </div>
            </section>

            {/* 2. Imjang Crew */}
            <section>
            <SectionHeader title="🔥 핫한 임장 크루" link="/crew" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {crewList.filter(i => i.type === 'recruit').slice(0, 4).map((item, index) => (
                <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 100}ms` }}>
                    <Card item={item} onClick={() => onItemClick(item)} isLiked={likedIds.includes(item.id)} onToggleLike={() => toggleLike(item.id)} />
                </div>
                ))}
            </div>
            </section>

            {/* 3. Networking & Lecture */}
            <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <SectionHeader title="📚 스터디 & 네트워킹" link="/networking" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {networkingList.slice(0, 2).map((item, index) => (
                        <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 100}ms` }}>
                            <Card item={item} onClick={() => onItemClick(item)} isLiked={likedIds.includes(item.id)} onToggleLike={() => toggleLike(item.id)} />
                        </div>
                        ))}
                    </div>
                </div>
                <div>
                    <SectionHeader title="🎓 재테크 강의" link="/lecture" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {lectureList.slice(0, 2).map((item, index) => (
                        <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 100}ms` }}>
                            <Card item={item} onClick={() => onItemClick(item)} isLiked={likedIds.includes(item.id)} onToggleLike={() => toggleLike(item.id)} />
                        </div>
                        ))}
                    </div>
                </div>
            </div>
            </section>

            {/* 4. Real Reviews Section */}
            <section className="pt-8 border-t border-slate-200">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center mb-8">
                    임풋 멤버들의 <span className="text-blue-600 bg-blue-50 px-2 rounded-lg">찐 후기</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayReviews.map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${idx * 100}ms` }}>
                            <Quote className="absolute top-4 right-4 text-slate-100 fill-slate-100 w-10 h-10" />
                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className={`${i < item.review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                                ))}
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed mb-4 line-clamp-3">"{item.review.text}"</p>
                            <div className="flex items-center gap-3 border-t border-slate-50 pt-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                    {item.review.user.charAt(0)}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold text-slate-900 truncate">{item.review.user}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{item.itemTitle}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-8">
                    <button className="text-slate-500 font-bold text-sm hover:text-slate-800 underline underline-offset-4">후기 더보기</button>
                </div>
            </section>
        </div>
    </div>
  );
};

export default Home;
