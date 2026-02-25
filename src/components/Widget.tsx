import React from 'react';
import { PanchangData, UTTARAKHAND_FESTIVALS, getPujaVratForDate } from '../services/panchangService';
import { translations, Language } from '../translations';
import { Sun, Moon, Star, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { NAKSHATRA_DETAILS } from '../data/nakshatras';

interface WidgetProps {
  panchang: PanchangData | null;
  language: Language;
  date: Date;
}

export const PanchangWidget: React.FC<WidgetProps> = ({ panchang, language, date }) => {
  const t = translations[language];
  if (!panchang) return null;

  const vrats = getPujaVratForDate(panchang);
  const festival = UTTARAKHAND_FESTIVALS.find(f => f.month === date.getMonth() && f.day === date.getDate());
  const nakshatraDetail = NAKSHATRA_DETAILS[panchang.nakshatra.index % 27][language];

  return (
    <div className="spiritual-card saffron-gradient text-white p-4 shadow-xl overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute -top-4 -right-4 opacity-10">
        <Sun size={80} />
      </div>
      
      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest opacity-80 font-bold">
              {t.varas[date.getDay()]} • {format(date, 'MMM dd')}
            </h3>
            <p className="text-lg font-hindi font-bold leading-tight mt-1">
              {panchang.tithi.index < 15 ? t.pakshas[0] : t.pakshas[1]} {t.tithis[panchang.tithi.index]}
            </p>
          </div>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Sun size={16} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/10 p-2 rounded-lg border border-white/10 flex flex-col justify-center">
            <div className="flex items-center gap-1 text-[8px] uppercase opacity-60 font-bold">
              <Star size={8} />
              <span>Nakshatra</span>
            </div>
            <p className="text-xs font-hindi font-bold truncate">
              {t.nakshatras[panchang.nakshatra.index % 27]}
            </p>
          </div>
          <div className="bg-black/10 p-2 rounded-lg border border-white/10 flex flex-col justify-center">
            <div className="flex items-center gap-1 text-[8px] uppercase opacity-60 font-bold">
              <Flame size={8} />
              <span>Yoga</span>
            </div>
            <p className="text-xs font-hindi font-bold truncate">
              {t.yogas[panchang.yoga.index % 27]}
            </p>
          </div>
        </div>

        {/* Nakshatra Details Block */}
        <div className="bg-black/20 rounded-lg p-2.5 border border-white/10">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] uppercase opacity-70 font-bold tracking-wider">
              {language === 'hi' ? 'शासक देवता' : 'Ruling Deity'}
            </span>
            <span className="text-xs font-bold text-amber-300 font-hindi">{nakshatraDetail.deity}</span>
          </div>
          <p className="text-[10px] opacity-90 italic leading-tight font-hindi">
            "{nakshatraDetail.trait}"
          </p>
        </div>

        {(festival || vrats.length > 0) && (
          <div className="mt-1 flex items-center gap-2 bg-white/20 px-2 py-1.5 rounded-lg border border-white/20">
            <Flame size={12} className="text-amber-300 animate-pulse" />
            <div className="flex-grow overflow-hidden">
              <p className="text-[10px] font-bold truncate">
                {festival ? (language === 'hi' ? festival.nameHi : festival.name) : (language === 'hi' ? vrats[0].nameHi : vrats[0].name)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
