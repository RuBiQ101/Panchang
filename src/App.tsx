/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Sun, 
  Moon, 
  MapPin, 
  Clock, 
  Compass, 
  Star, 
  Info,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Map,
  Users,
  BookOpen,
  WifiOff,
  Languages,
  InfoIcon,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { calculatePanchang, PanchangData, UTTARAKHAND_FESTIVALS, getPujaVratForDate } from './services/panchangService';
import { storageService } from './services/storageService';
import { NorthIndianChart } from './components/Kundali';
import { AstrologerSection } from './components/AstrologerSection';
import { PujaVratSection } from './components/PujaVratSection';
import { PanchangWidget } from './components/Widget';
import { translations, Language } from './translations';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Download, Wifi, WifiOff, Trash2, BookOpen, Languages, Info as InfoIcon, Layout } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type View = 'dashboard' | 'calendar' | 'panchang' | 'kundali' | 'festivals' | 'muhurta' | 'astrologers' | 'pujavrat' | 'offline' | 'about' | 'widget' | 'karmakanda';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [location, setLocation] = useState<{ lat: number; lon: number; elevation: number }>({
    lat: 30.3165, // Dehradun default
    lon: 78.0322,
    elevation: 435
  });
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineData, setIsOfflineData] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (navigator.geolocation && isOnline) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          elevation: pos.coords.altitude || 435
        });
      });
    }
  }, [isOnline]);

  useEffect(() => {
    // Try to get from cache first if offline
    const cached = storageService.getCachedPanchang(currentDate);
    if (!isOnline && cached) {
      setPanchang(cached);
      setIsOfflineData(true);
    } else {
      const data = calculatePanchang(currentDate, location.lat, location.lon, location.elevation);
      setPanchang(data);
      setIsOfflineData(false);
      // Auto-cache current day
      if (isOnline) storageService.savePanchangData(currentDate, data);
    }
  }, [currentDate, location, isOnline]);

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: Compass },
    { id: 'calendar', label: t.calendar, icon: CalendarIcon },
    { id: 'panchang', label: t.panchang, icon: Sun },
    { id: 'muhurta', label: t.muhurta, icon: Clock },
    { id: 'pujavrat', label: t.pujavrat, icon: BookOpen },
    { id: 'festivals', label: t.festivals, icon: Map },
    { id: 'kundali', label: t.kundali, icon: Star },
    { id: 'astrologers', label: t.astrologers, icon: Users },
    { id: 'offline', label: t.offline, icon: Download },
    { id: 'widget', label: 'Widget Preview', icon: Layout },
    { id: 'about', label: t.about, icon: InfoIcon },
  ];

  const renderDashboard = () => (
    <div className="p-4 space-y-6">
      {/* Widget at the top of Dashboard */}
      <PanchangWidget panchang={panchang} language={language} date={currentDate} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {menuItems.filter(item => item.id !== 'dashboard').map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView(item.id as View)}
            className="aspect-square spiritual-card flex flex-col items-center justify-center gap-2 p-4 text-ink hover:text-saffron transition-colors"
          >
            <div className="w-12 h-12 rounded-full saffron-gradient flex items-center justify-center text-white shadow-lg">
              <item.icon size={24} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderPanchang = () => (
    <div className="p-4 space-y-6">
      <div className="spiritual-card p-6 saffron-gradient text-white">
        <h2 className="text-3xl font-serif italic mb-2">{t.varas[currentDate.getDay()]}</h2>
        <p className="text-sm opacity-90 font-hindi">{t.system}</p>
        <div className="mt-4 flex justify-between items-end">
          <div>
            <p className="text-lg font-hindi">
              {panchang ? (panchang.tithi.index < 15 ? t.pakshas[0] : t.pakshas[1]) : ''} {panchang ? t.tithis[panchang.tithi.index] : ''}
            </p>
            <p className="text-xs opacity-75">Tithi Progress: {Math.round((panchang?.tithi.progress || 0) * 100)}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-hindi">Nakshatra: {panchang ? t.nakshatras[panchang.nakshatra.index % 27] : ''}</p>
            <p className="text-sm font-hindi">Yoga: {panchang ? t.yogas[panchang.yoga.index % 27] : ''}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="spiritual-card p-3 flex flex-col items-center justify-center text-center">
          <p className="text-[9px] uppercase text-ink/50 font-bold tracking-wider mb-1">{t.gate}</p>
          <p className="text-sm font-hindi font-bold text-saffron-dark">{panchang?.gate}</p>
        </div>
        <div className="spiritual-card p-3 flex flex-col items-center justify-center text-center">
          <p className="text-[9px] uppercase text-ink/50 font-bold tracking-wider mb-1">{t.lagna}</p>
          <p className="text-sm font-hindi font-bold text-saffron-dark">{panchang ? (language === 'hi' ? t.rashis[panchang.lagna.index] : panchang.lagna.name) : ''}</p>
        </div>
        <div className="spiritual-card p-3 flex flex-col items-center justify-center text-center">
          <p className="text-[9px] uppercase text-ink/50 font-bold tracking-wider mb-1">{t.rashi}</p>
          <p className="text-sm font-hindi font-bold text-saffron-dark">{panchang ? (language === 'hi' ? t.rashis[panchang.rashi.index] : panchang.rashi.name) : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="spiritual-card p-4 flex items-center gap-3">
          <Sun className="text-saffron" size={20} />
          <div>
            <p className="text-[10px] uppercase text-ink/50">{t.sunrise}</p>
            <p className="text-sm font-bold">{panchang ? format(panchang.sunrise, 'hh:mm a') : '--:--'}</p>
          </div>
        </div>
        <div className="spiritual-card p-4 flex items-center gap-3">
          <Moon className="text-indigo-600" size={20} />
          <div>
            <p className="text-[10px] uppercase text-ink/50">{t.moonrise}</p>
            <p className="text-sm font-bold">{panchang?.moonrise ? format(panchang.moonrise, 'hh:mm a') : 'No Rise'}</p>
          </div>
        </div>
      </div>

      <div className="spiritual-card p-6 space-y-4">
        <h3 className="font-serif italic text-xl border-b border-gold/20 pb-2">{t.ishtaKaal}</h3>
        <div className="flex justify-around text-center">
          <div>
            <p className="text-2xl font-hindi text-saffron">{panchang?.ishtaKaal.ghati}</p>
            <p className="text-[10px] uppercase text-ink/50">{t.ghati}</p>
          </div>
          <div>
            <p className="text-2xl font-hindi text-saffron">{panchang?.ishtaKaal.pala}</p>
            <p className="text-[10px] uppercase text-ink/50">{t.pala}</p>
          </div>
          <div>
            <p className="text-2xl font-hindi text-saffron">{panchang?.ishtaKaal.vikal}</p>
            <p className="text-[10px] uppercase text- ink/50">{t.vikal}</p>
          </div>
        </div>
        <p className="text-[10px] text-center italic text-ink/40">Calculated from local sunrise: {panchang ? format(panchang.sunrise, 'hh:mm:ss a') : ''}</p>
      </div>
    </div>
  );

  const renderMuhurta = () => (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-serif italic px-2">{t.dailyMuhurtas}</h2>
      <div className="spiritual-card overflow-hidden">
        <div className="bg-emerald-50 p-4 border-b border-emerald-100">
          <div className="flex justify-between items-center">
            <span className="text-emerald-800 font-bold uppercase text-xs">{t.abhijit}</span>
            <span className="text-emerald-600 text-xs italic">Auspicious</span>
          </div>
          <p className="text-xl font-hindi mt-1">
            {panchang ? `${format(panchang.abhijit.start, 'hh:mm a')} - ${format(panchang.abhijit.end, 'hh:mm a')}` : '--:--'}
          </p>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] uppercase text-red-500 font-bold">{t.rahuKaal}</p>
              <p className="text-sm font-hindi">
                {panchang ? `${format(panchang.rahukaal.start, 'hh:mm a')} - ${format(panchang.rahukaal.end, 'hh:mm a')}` : '--:--'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-amber-600 font-bold">{t.gulikaKaal}</p>
              <p className="text-sm font-hindi">
                {panchang ? `${format(panchang.gulikakaal.start, 'hh:mm a')} - ${format(panchang.gulikakaal.end, 'hh:mm a')}` : '--:--'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFestivals = () => (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-serif italic px-2">{t.ukFestivals}</h2>
      <div className="space-y-3">
        {UTTARAKHAND_FESTIVALS.map((fest, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={fest.name} 
            className="spiritual-card p-4 border-l-4 border-l-saffron"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-hindi font-bold text-lg text-saffron-dark">
                {language === 'hi' ? fest.nameHi : fest.name}
              </h3>
              <span className="text-[10px] bg-parchment px-2 py-1 rounded text-ink/60 font-bold">
                {format(new Date(2026, fest.month, fest.day), 'MMM dd')}
              </span>
            </div>
            <p className="text-xs text-ink/70 mt-1 italic">
              {language === 'hi' ? fest.descriptionHi : fest.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderKundali = () => (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif italic">{t.janmaKundali}</h2>
        <p className="text-xs text-ink/50 uppercase tracking-widest mt-1">{t.northIndianStyle}</p>
      </div>
      <NorthIndianChart birthDetails={{
        date: format(currentDate, 'yyyy-MM-dd'),
        time: format(currentDate, 'HH:mm'),
        lat: location.lat,
        lon: location.lon
      }} />
      <div className="spiritual-card p-4 text-xs space-y-2 italic text-ink/70">
        <p>• Ayanamsa: Lahiri (Chitrapaksha)</p>
        <p>• Calculation based on current location: {location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E</p>
        <p>• Elevation: {location.elevation.toFixed(0)}m (Himalayan Adjusted)</p>
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="p-4 space-y-4">
      <div className="spiritual-card p-2">
        <Calendar 
          onChange={(val) => setCurrentDate(val as Date)} 
          value={currentDate}
          className="w-full border-none font-sans"
          tileClassName={({ date }) => {
            const isFest = UTTARAKHAND_FESTIVALS.some(f => f.month === date.getMonth() && f.day === date.getDate());
            return isFest ? 'bg-saffron/20 text-saffron-dark font-bold rounded-full' : '';
          }}
        />
      </div>
      <div className="spiritual-card p-4 saffron-gradient text-white">
        <h3 className="font-serif italic text-lg">{t.selectedDate}</h3>
        <p className="text-2xl font-hindi">{format(currentDate, 'EEEE, MMMM dd, yyyy')}</p>
        {UTTARAKHAND_FESTIVALS.find(f => f.month === currentDate.getMonth() && f.day === currentDate.getDate()) && (
          <div className="mt-2 bg-white/20 p-2 rounded text-sm font-bold">
            🎉 {UTTARAKHAND_FESTIVALS.find(f => f.month === currentDate.getMonth() && f.day === currentDate.getDate())?.name}
          </div>
        )}
      </div>
    </div>
  );

  const renderOffline = () => {
    const cachedDates = Object.keys(storageService.getAllCached());
    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-serif italic">{t.offlineMode}</h2>
          <p className="text-[10px] text-ink/50 uppercase tracking-widest mt-1">Access Panchang anywhere</p>
        </div>

        <div className="spiritual-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{t.downloadData}</h3>
            <Download className="text-saffron" size={20} />
          </div>
          <p className="text-xs text-ink/60 italic">Download Panchang for the current and next month to use without internet.</p>
          <button 
            onClick={() => {
              const now = new Date();
              storageService.downloadMonth(now.getFullYear(), now.getMonth(), location.lat, location.lon, location.elevation);
              storageService.downloadMonth(now.getFullYear(), now.getMonth() + 1, location.lat, location.lon, location.elevation);
              alert('Download Complete!');
              setView('offline'); // Refresh
            }}
            className="w-full py-3 saffron-gradient text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <Download size={18} />
            {t.downloadNext60}
          </button>
        </div>

        <div className="spiritual-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{t.cachedData}</h3>
            <span className="text-[10px] bg-parchment px-2 py-1 rounded-full text-ink/40 font-bold">{cachedDates.length} Days</span>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
            {cachedDates.sort().map(date => (
              <div key={date} className="flex justify-between items-center text-xs p-2 bg-parchment rounded-lg">
                <span>{date}</span>
                <span className="text-emerald-600 font-bold">{t.offlineReady}</span>
              </div>
            ))}
            {cachedDates.length === 0 && <p className="text-center text-xs text-ink/30 italic">{t.noData}</p>}
          </div>
          <button 
            onClick={() => {
              storageService.clearCache();
              setView('offline');
            }}
            className="w-full py-2 border border-red-200 text-red-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <Trash2 size={14} />
            {t.clearAll}
          </button>
        </div>
      </div>
    );
  };

  const renderAbout = () => (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif italic">{t.aboutTitle}</h2>
        <p className="text-[10px] text-ink/50 uppercase tracking-widest mt-1">Technical Details</p>
      </div>
      <div className="spiritual-card p-6 space-y-4">
        <p className="text-sm leading-relaxed text-ink/80">
          {t.aboutDesc}
        </p>
        <div className="pt-4 border-t border-gold/10 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-ink/40">Month End</span>
            <span className="font-bold text-saffron">Amavasya (New Moon)</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-ink/40">Ayanamsa</span>
            <span className="font-bold text-saffron">Lahiri (Chitrapaksha)</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-ink/40">Era</span>
            <span className="font-bold text-saffron">Vikram Samvat</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWidgetPreview = () => (
    <div className="p-4 space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif italic">Home Screen Widget</h2>
        <p className="text-xs text-ink/50 uppercase tracking-widest">Glanceable Daily Panchang</p>
      </div>
      
      <div className="w-full max-w-[300px] aspect-square">
        <PanchangWidget panchang={panchang} language={language} date={currentDate} />
      </div>

      <div className="spiritual-card p-6 w-full max-w-sm space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <InfoIcon size={16} className="text-saffron" />
          How to add to Home Screen
        </h3>
        <ol className="text-xs text-ink/70 space-y-2 list-decimal pl-4">
          <li>Tap the 'Share' or 'Menu' button in your browser.</li>
          <li>Select 'Add to Home Screen'.</li>
          <li>The app icon will appear on your device home screen for quick access.</li>
        </ol>
      </div>
    </div>
  );

  const renderKarmakanda = () => (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif italic">{language === 'hi' ? 'दैनिक कर्मकांड' : 'Daily Karmakanda'}</h2>
        <p className="text-[10px] text-ink/50 uppercase tracking-widest mt-1">
          {language === 'hi' ? 'नित्य कर्म मंत्र' : 'Daily Ritual Mantras'}
        </p>
      </div>
      
      <div className="space-y-4">
        {[
          {
            title: language === 'hi' ? 'प्रतिज्ञा संकल्प' : 'Pratigya Sankalp',
            mantra: 'ॐ विष्णुर्विष्णुर्विष्णुः। अद्य ब्रह्मणोऽह्नि द्वितीयपरार्धे श्रीश्वेतवाराहकल्पे वैवस्वतमन्वन्तरे अष्टाविंशतितमे कलियुगे कलिप्रथमचरणे भूर्लोके जम्बूद्वीपे भारतवर्षे भरतखण्डे आर्यावर्तान्तर्गत... अमुक नाम्नोऽहं श्रुतिस्मृतिपुराणोक्त फल प्राप्त्यर्थं अमुक कर्म करिष्ये।',
            meaning: language === 'hi' ? 'मैं श्रुति, स्मृति और पुराणों में बताए गए फलों की प्राप्ति के लिए इस विशिष्ट समय और स्थान पर इस कर्म (पूजा/अनुष्ठान) को करने का संकल्प लेता हूँ।' : 'I resolve to perform this action (puja/ritual) for the attainment of the fruits mentioned in the Shruti, Smriti, and Puranas, in this specific time and place.'
          },
          {
            title: language === 'hi' ? 'प्रातः स्मरण (जागने पर)' : 'Pratah Smaran (On Waking Up)',
            mantra: 'कराग्रे वसते लक्ष्मीः करमध्ये सरस्वती।\nकरमूले तु गोविन्दः प्रभाते करदर्शनम्॥',
            meaning: language === 'hi' ? 'हाथ के अग्र भाग में लक्ष्मी, मध्य में सरस्वती और मूल में भगवान गोविंद का निवास है। इसलिए सुबह उठकर अपनी हथेलियों के दर्शन करने चाहिए।' : 'At the tip of the hands resides Lakshmi, in the middle Saraswati, and at the base Govinda. Therefore, one should look at one\'s palms in the morning.'
          },
          {
            title: language === 'hi' ? 'स्नान मंत्र' : 'Snan Mantra (Bathing)',
            mantra: 'गंगे च यमुने चैव गोदावरी सरस्वति।\nनर्मदे सिन्धु कावेरी जलेऽस्मिन् सन्निधिं कुरु॥',
            meaning: language === 'hi' ? 'हे गंगा, यमुना, गोदावरी, सरस्वती, नर्मदा, सिंधु और कावेरी नदियों! आप सभी मेरे इस स्नान के जल में पधारें।' : 'O Holy Rivers Ganga, Yamuna, Godavari, Saraswati, Narmada, Sindhu, and Kaveri! Please be present in this water.'
          },
          {
            title: language === 'hi' ? 'सूर्य अर्घ्य मंत्र' : 'Surya Arghya (Offering Water to Sun)',
            mantra: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं\nभर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥\nॐ सूर्याय नमः॥',
            meaning: language === 'hi' ? 'हम उस प्राणस्वरूप, दुःखनाशक, सुखस्वरूप, श्रेष्ठ, तेजस्वी, पापनाशक, देवस्वरूप परमात्मा को अंतःकरण में धारण करें। वह परमात्मा हमारी बुद्धि को सन्मार्ग में प्रेरित करे।' : 'We meditate on the glory of the Creator; who has created the Universe; who is worthy of Worship; who is the embodiment of Knowledge and Light; who is the remover of Sin and Ignorance. May He open our hearts and enlighten our Intellect.'
          },
          {
            title: language === 'hi' ? 'भोजन मंत्र' : 'Bhojan Mantra (Before Eating)',
            mantra: 'ब्रह्मार्पणं ब्रह्म हविर्ब्रह्माग्नौ ब्रह्मणा हुतम्।\nब्रह्मैव तेन गन्तव्यं ब्रह्मकर्मसमाधिना॥',
            meaning: language === 'hi' ? 'अर्पण भी ब्रह्म है, हवि भी ब्रह्म है, अग्नि भी ब्रह्म है और आहुति देने वाला भी ब्रह्म है। जो कर्म में ब्रह्म को ही देखता है, वह ब्रह्म को ही प्राप्त होता है।' : 'The act of offering is Brahman, the oblation is Brahman. By Brahman it is offered into the fire of Brahman. Brahman is that which is to be attained by samadhi in Brahman action.'
          },
          {
            title: language === 'hi' ? 'शयन मंत्र (सोने से पहले)' : 'Shayan Mantra (Before Sleeping)',
            mantra: 'रामं स्कन्दं हनूमन्तं वैनतेयं वृकोदरम्।\nशयने यः स्मरेन्नित्यं दुःस्वप्नस्तस्य नश्यति॥',
            meaning: language === 'hi' ? 'जो व्यक्ति सोते समय भगवान राम, कार्तिकेय, हनुमान, गरुड़ और भीम का स्मरण करता है, उसके बुरे सपने नष्ट हो जाते हैं।' : 'One who remembers Rama, Skanda (Kartikeya), Hanuman, Garuda, and Bhima before sleeping, their bad dreams are destroyed.'
          }
        ].map((item, idx) => (
          <div key={idx} className="spiritual-card p-4 space-y-3">
            <h3 className="font-bold text-saffron-dark font-hindi">{item.title}</h3>
            <div className="bg-saffron/5 p-3 rounded-lg border border-saffron/10">
              <p className="font-hindi text-lg leading-relaxed text-center whitespace-pre-line text-ink">
                {item.mantra}
              </p>
            </div>
            <p className="text-xs text-ink/70 italic leading-relaxed">
              {item.meaning}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-parchment font-sans text-ink pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-parchment/80 backdrop-blur-md border-b border-gold/10 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={() => setView('karmakanda')} className="p-2 hover:bg-black/5 rounded-full transition-colors text-saffron">
            <BookOpen size={24} />
          </button>
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <Menu size={24} />
          </button>
        </div>
        <div className="text-center">
          <h1 className="font-serif text-xl italic font-bold text-saffron-dark">{t.appName}</h1>
          <div className="flex items-center justify-center gap-1 text-[10px] text-ink/40 uppercase tracking-tighter">
            <MapPin size={10} />
            <span>Uttarakhand • {location.lat.toFixed(1)}°N, {location.lon.toFixed(1)}°E</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setLanguage(prev => prev === 'en' ? 'hi' : 'en')}
            className="p-2 bg-parchment border border-gold/20 rounded-lg text-saffron hover:bg-saffron/10 transition-colors flex items-center gap-1"
          >
            <Languages size={16} />
            <span className="text-[10px] font-bold uppercase">{language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>
          {isOfflineData && (
            <div className="flex items-center gap-1 text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              <WifiOff size={8} />
              <span>{t.offlineStatus}</span>
            </div>
          )}
          {!isOnline && !isOfflineData && (
            <div className="flex items-center gap-1 text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">
              <WifiOff size={8} />
              <span>{t.noDataStatus}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'dashboard' && renderDashboard()}
            {view === 'panchang' && renderPanchang()}
            {view === 'calendar' && renderCalendar()}
            {view === 'muhurta' && renderMuhurta()}
            {view === 'festivals' && renderFestivals()}
            {view === 'kundali' && renderKundali()}
            {view === 'astrologers' && <AstrologerSection language={language} />}
            {view === 'pujavrat' && <PujaVratSection panchang={panchang} language={language} />}
            {view === 'offline' && renderOffline()}
            {view === 'about' && renderAbout()}
            {view === 'widget' && renderWidgetPreview()}
            {view === 'karmakanda' && renderKarmakanda()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-parchment z-[70] shadow-2xl p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-serif italic text-2xl text-saffron-dark">Siddhidatri</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-black/5 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <nav className="space-y-2 flex-grow">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setView(item.id as View);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl transition-all font-semibold",
                      view === item.id 
                        ? "bg-saffron text-white shadow-lg" 
                        : "hover:bg-saffron/10 text-ink/70"
                    )}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="mt-auto pt-6 border-t border-gold/10 text-[10px] text-ink/30 text-center uppercase tracking-widest">
                {t.version}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Quick Nav (Mobile Style) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-lg border-t border-gold/10 px-6 py-3 flex justify-between items-center z-40">
        <button 
          onClick={() => setView('dashboard')}
          className={cn("flex flex-col items-center gap-1", view === 'dashboard' ? "text-saffron" : "text-ink/40")}
        >
          <Compass size={20} />
          <span className="text-[10px] font-bold uppercase">{t.home}</span>
        </button>
        <button 
          onClick={() => setView('panchang')}
          className={cn("flex flex-col items-center gap-1", view === 'panchang' ? "text-saffron" : "text-ink/40")}
        >
          <Sun size={20} />
          <span className="text-[10px] font-bold uppercase">{t.panchang}</span>
        </button>
        <button 
          onClick={() => setView('calendar')}
          className={cn("flex flex-col items-center gap-1", view === 'calendar' ? "text-saffron" : "text-ink/40")}
        >
          <CalendarIcon size={20} />
          <span className="text-[10px] font-bold uppercase">{t.calendar}</span>
        </button>
        <button 
          onClick={() => setView('kundali')}
          className={cn("flex flex-col items-center gap-1", view === 'kundali' ? "text-saffron" : "text-ink/40")}
        >
          <Star size={20} />
          <span className="text-[10px] font-bold uppercase">{t.kundali}</span>
        </button>
      </nav>
    </div>
  );
}
