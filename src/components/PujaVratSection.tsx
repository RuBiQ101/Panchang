import React from 'react';
import { getPujaVratForDate, PanchangData } from '../services/panchangService';
import { motion } from 'motion/react';
import { Flame, Info, Clock } from 'lucide-react';
import { translations, Language } from '../translations';

interface PujaVratSectionProps {
  panchang: PanchangData | null;
  language: Language;
}

export const PujaVratSection: React.FC<PujaVratSectionProps> = ({ panchang, language }) => {
  if (!panchang) return null;
  
  const vrats = getPujaVratForDate(panchang);
  const t = translations[language];

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif italic">{t.pujaVrat}</h2>
        <p className="text-[10px] text-ink/50 uppercase tracking-widest mt-1">Daily Rituals & Significance</p>
      </div>

      {vrats.length === 0 ? (
        <div className="spiritual-card p-8 text-center space-y-2">
          <p className="text-ink/40 italic">{t.noVrats}</p>
          <p className="text-[10px] uppercase tracking-tighter text-ink/20">{t.standardPrayers}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vrats.map((vrat, idx) => (
            <motion.div
              key={vrat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="spiritual-card overflow-hidden"
            >
              <div className="saffron-gradient p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Flame size={20} />
                  <h3 className="font-hindi font-bold text-lg">
                    {language === 'hi' ? vrat.nameHi : vrat.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-[10px] bg-white/20 px-2 py-1 rounded-full">
                  <Clock size={10} />
                  <span>{language === 'hi' ? vrat.timingHi : vrat.timing}</span>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-saffron-dark font-bold text-[10px] uppercase">
                    <Info size={12} />
                    <span>{t.significance}</span>
                  </div>
                  <p className="text-sm text-ink/80 leading-relaxed">
                    {language === 'hi' ? vrat.significanceHi : vrat.significance}
                  </p>
                </div>

                <div className="bg-parchment p-3 rounded-xl border border-gold/10">
                  <p className="text-[10px] uppercase font-bold text-ink/40 mb-1">{t.rituals}</p>
                  <p className="text-xs text-ink/70 italic">
                    {language === 'hi' ? vrat.ritualsHi : vrat.rituals}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="spiritual-card p-4 bg-gold/5 border-gold/20">
        <h4 className="text-xs font-bold text-gold uppercase mb-2">{t.regionalNote}</h4>
        <p className="text-[10px] text-ink/60 leading-relaxed italic">
          {t.vratNote}
        </p>
      </div>
    </div>
  );
};
