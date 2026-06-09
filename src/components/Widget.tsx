import React from 'react';
import { PanchangData, UTTARAKHAND_FESTIVALS, getPujaVratForDate } from '../services/panchangService';
import { translations, Language } from '../translations';
import { Sun, Moon, Star, Flame, Clock, MapPin } from 'lucide-react';
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

  // Compute some friendly labels
  const tithiLabel = `${panchang.tithi.index < 15 ? t.pakshas[0] : t.pakshas[1]} ${t.tithis[panchang.tithi.index]}`;
  const nakshatraLabel = t.nakshatras[panchang.nakshatra.index % 27];
  const yogaLabel = t.yogas[panchang.yoga.index % 27];
  const rahuLabel = t.rahu;
  const gulikaLabel = t.gulika;
  const lagnaLabel = t.lagnaShort;
  const lagnaSign = language === 'hi' ? t.rashis[panchang.lagna.index] : panchang.lagna.name;
  const tithiProgress = Math.round((panchang.tithi.progress ?? 0) * 100);

  return (
    <div className="spiritual-card liquid-glass-panel bg-[#0f0b09] border border-rose-gold-500/10 text-rose-gold-100 p-4 shadow-md overflow-hidden relative">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-rose-gold-100/30 font-semibold">{t.varas[date.getDay()]}</div>
          <h3 className="text-xl font-serif font-bold leading-tight text-rose-gold-400 mt-1">{tithiLabel}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-gold-900/20 text-rose-gold-100 text-xs">
              <Sun size={12} /> {format(panchang.sunrise, 'HH:mm')}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-gold-900/20 text-rose-gold-100 text-xs">
              <Sun size={12} /> {format(panchang.sunset, 'HH:mm')}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-gold-900/20 text-rose-gold-100 text-xs">
              <Moon size={12} /> {panchang.moonrise ? format(panchang.moonrise, 'HH:mm') : '--:--'}
            </span>
          </div>
        </div>

        <div className="min-w-[160px] text-right">
          <div className="text-sm text-rose-gold-100/40 uppercase tracking-wider">{nakshatraLabel}</div>
          <div className="text-xs text-rose-gold-400 mt-1">{nakshatraDetail.deity}</div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <div className="text-[11px] text-rose-gold-100/60">{t.tithiProgress}</div>
            <div className="w-14 h-4 bg-rose-gold-900/20 rounded-full overflow-hidden">
              <div style={{ width: `${tithiProgress}%` }} className="h-4 bg-rose-gold-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-rose-gold-100/60">
            <span className="flex items-center gap-1"><Clock size={12} /> {rahuLabel}</span>
            <span className="font-bold text-rose-gold-100">{format(panchang.rahukaal.start, 'HH:mm')} - {format(panchang.rahukaal.end, 'HH:mm')}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-rose-gold-100/60">
            <span className="flex items-center gap-1"><Clock size={12} /> {gulikaLabel}</span>
            <span className="font-bold text-rose-gold-100">{format(panchang.gulikakaal.start, 'HH:mm')} - {format(panchang.gulikakaal.end, 'HH:mm')}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-rose-gold-100/60">
            <span className="flex items-center gap-1"><MapPin size={12} /> {lagnaLabel}</span>
            <span className="font-bold text-rose-gold-100">{lagnaSign}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-rose-gold-100/60">{t.yoga}</div>
          <div className="text-sm font-bold text-rose-gold-100">{yogaLabel}</div>
          <div className="mt-2 text-xs text-rose-gold-100/70 italic">"{nakshatraDetail.trait}"</div>
        </div>
      </div>

      {(festival || vrats.length > 0) && (
        <div className="mt-4 px-3 py-2 rounded-lg bg-saffron/6 border border-saffron/10 flex items-center gap-3">
          <Flame size={14} className="text-saffron" />
          <div>
            <div className="text-sm font-bold text-saffron-dark">{festival ? (language === 'hi' ? festival.nameHi : festival.name) : (language === 'hi' ? vrats[0].nameHi : vrats[0].name)}</div>
            <div className="text-xs text-rose-gold-100/60">{language === 'hi' ? 'त्योहार/व्रत' : 'Festival / Vrat'}</div>
          </div>
        </div>
      )}
    </div>
  );
};
