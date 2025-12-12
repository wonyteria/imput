
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { AnyItem, CategoryType, BadgeConfig, CrewItem } from '../types';
import { Quote, Star, SearchX } from 'lucide-react';

interface CategoryPageProps {
  categoryType: CategoryType;
  items: AnyItem[];
  badges: BadgeConfig[];
  onItemClick: (item: AnyItem) => void;
  likedIds: number[];
  toggleLike: (id: number) => void;
  bannerImg?: string;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ 
  categoryType, 
  items, 
  badges, 
  onItemClick,
  likedIds,
  toggleLike,
  bannerImg
}) => {
  const [filter, setFilter] = useState('all');
  const [filteredItems, setFilteredItems] = useState<AnyItem[]>(items);

  // Default Header Info
  let title = "";
  let description = "";
  let reviewTitle = "생생한 참여 후기";

  if (categoryType === 'minddate') {
      title = "💘 마인드데이트";
      description = "재테크 가치관이 맞는 소중한 인연을 찾아보세요.";
      reviewTitle = "💘 설레는 만남 후기";
  } else if (categoryType === 'crew') {
      title = "🏃 임장 크루";
      description = "혼자서는 막막한 임장, 전문가 리더와 함께 걸어요.";
      reviewTitle = "👟 임장 크루 찐 후기";
  } else if (categoryType === 'networking') {
      title = "📚 스터디 & 네트워킹";
      description = "함께 공부하고 성장하는 부동산 커뮤니티.";
      reviewTitle = "📚 멤버들의 성장 후기";
  } else if (categoryType === 'lecture') {
      title = "🎓 재테크 강의";
      description = "검증된 전문가의 노하우를 배우는 프리미엄 클래스.";
      reviewTitle = "🎓 수강생 리얼 후기";
  }

  useEffect(() => {
    // Initial Filter Setup
    if (categoryType === 'crew') {
        setFilter('recruit'); // Default to recruit for crew
    } else {
        setFilter('all');
    }
  }, [categoryType]);

  useEffect(() => {
    let result = [...items];

    // Filter Logic
    if (filter !== 'all') {
      if (categoryType === 'lecture') {
        result = result.filter((i: any) => i.format === filter);
      } else {
        result = result.filter((i: any) => i.type === filter);
      }
    }

    // Sort Logic (Only for Reports: Popularity)
    if (categoryType === 'crew' && filter === 'report') {
        result.sort((a, b) => {
            const countA = (a as CrewItem).purchaseCount || 0;
            const countB = (b as CrewItem).purchaseCount || 0;
            return countB - countA; // Descending order
        });
    }

    setFilteredItems(result);
  }, [filter, items, categoryType]);

  // Extract items that have reviews
  const reviewedItems = items.filter(i => i.reviews && i.reviews.length > 0);

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Dynamic Banner with Image Background */}
      <div className="rounded-3xl mb-8 shadow-lg relative overflow-hidden group h-[240px] md:h-[280px]">
        <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: `url(${bannerImg || 'https://via.placeholder.com/1600x400'})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight text-white drop-shadow-lg">{title}</h1>
            <p className="text-lg md:text-xl text-slate-100 font-medium max-w-2xl drop-shadow-md">{description}</p>
        </div>
      </div>

      {/* Sticky Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-200 pb-1 overflow-x-auto no-scrollbar sticky top-0 bg-slate-50/95 backdrop-blur z-20 pt-4 -mx-4 px-4 md:mx-0 md:px-0">
        {badges.map((badge) => (
          <button
            key={badge.value}
            onClick={() => setFilter(badge.value)}
            className={`px-6 py-3 rounded-t-lg text-sm font-bold transition-all relative top-[1px] whitespace-nowrap ${
              filter === badge.value
                ? `text-slate-900 border-b-2 border-slate-900 bg-slate-50`
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
            }`}
          >
            {badge.label}
          </button>
        ))}
      </div>

      {/* Grid Content with Staggered Animation */}
      {filteredItems.length > 0 ? (
        <div className={`grid gap-6 ${categoryType === 'lecture' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
          {filteredItems.map((item, index) => (
            <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 50}ms` }}>
              <Card 
                item={item} 
                onClick={() => onItemClick(item)} 
                isLiked={likedIds.includes(item.id)}
                onToggleLike={() => toggleLike(item.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <SearchX size={32} />
            </div>
            <p className="text-slate-800 font-bold text-lg mb-1">해당하는 콘텐츠가 없습니다.</p>
            <p className="text-slate-400 text-sm">다른 필터를 선택하거나 나중에 다시 확인해주세요.</p>
        </div>
      )}

      {/* Review Section (Generic for all categories) */}
      {reviewedItems.length > 0 && (
          <div className="mt-20 pt-10 border-t border-slate-200">
             <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">{reviewTitle}</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {reviewedItems.slice(0, 3).map((item, idx) => (
                     <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative hover:translate-y-[-4px] transition-transform cursor-pointer animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${idx * 100}ms` }} onClick={() => onItemClick(item)}>
                        <Quote className="absolute top-4 right-4 text-slate-100 fill-slate-100 w-10 h-10" />
                        <div className="flex items-center gap-3 mb-4">
                            <img src={item.img} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                            <div>
                                <p className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</p>
                                <div className="flex gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} className={`${i < (item.reviews?.[0]?.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                            "{item.reviews?.[0]?.text}"
                        </p>
                        <div className="mt-4 text-xs text-slate-400 text-right">
                             - {item.reviews?.[0]?.user}님
                        </div>
                     </div>
                 ))}
             </div>
          </div>
      )}
    </div>
  );
};

export default CategoryPage;
