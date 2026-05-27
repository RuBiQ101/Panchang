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
  User,
  BookOpen,
  WifiOff,
  Languages,
  Info as InfoIcon,
  Trash2,
  Download,
  Wifi,
  Layout,
  Share2,
  Library,
  Flame,
  Sparkles,
  Smartphone,
  Clock2,
  Bell,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { calculatePanchang, PanchangData, UTTARAKHAND_FESTIVALS, getPujaVratForDate } from './services/panchangService';
import { storageService } from './services/storageService';
import { NorthIndianChart } from './components/Kundali';
import { AstrologerSection } from './components/AstrologerSection';
import { PujaVratSection } from './components/PujaVratSection';
import { PanchangWidget } from './components/Widget';
import { SpiritualLibrary } from './components/SpiritualLibrary';
import { translations, Language } from './translations';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import VedicWatch from './components/VedicWatch';
import { getNotificationSettings, saveNotificationSettings, NotificationSettings } from './services/notificationService';
import { profileService, UserProfile } from './services/profileService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type View = 'dashboard' | 'calendar' | 'panchang' | 'kundali' | 'festivals' | 'muhurta' | 'astrologers' | 'pujavrat' | 'offline' | 'about' | 'widget' | 'karmakanda' | 'testing' | 'install' | 'vedicwatch' | 'settings' | 'profile';

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
  const [birthPanchang, setBirthPanchang] = useState<PanchangData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(profileService.getProfile());
  const [birthDetails, setBirthDetails] = useState({
    date: userProfile ? userProfile.birthDate : format(new Date(), 'yyyy-MM-dd'),
    time: userProfile ? userProfile.birthTime : format(new Date(), 'HH:mm'),
    lat: userProfile ? userProfile.birthLocation.lat : location.lat,
    lon: userProfile ? userProfile.birthLocation.lon : location.lon
  });

  const t = translations[language];

  const getCardinalDirection = (azimuth: number) => {
    const directions = t.directions;
    const index = Math.round(azimuth / 22.5) % 16;
    return directions[index];
  };

  useEffect(() => {
    const initNotifications = async () => {
      const settings = getNotificationSettings();
      if (settings.enabled) {
        await saveNotificationSettings(settings, language);
      }
    };
    initNotifications();
  }, [language]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!userProfile) {
      setBirthDetails(prev => ({ ...prev, lat: location.lat, lon: location.lon }));
    }
  }, [location, userProfile]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const getPublicUrl = () => {
    const origin = window.location.origin;
    // If we are already on the shared (-pre-) URL, return it as is
    if (origin.includes('-pre-')) {
      return origin;
    }
    // If we are on the dev URL, replace -dev- with -pre-
    if (origin.includes('-dev-')) {
      return origin.replace('-dev-', '-pre-');
    }
    // Fallback to current origin
    return origin;
  };

  const handleShare = async () => {
    const publicUrl = getPublicUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Siddhidatri Panchang',
          text: 'Check out today\'s Vedic Panchang for Uttarakhand!',
          url: publicUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setShowShareModal(true);
        }
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

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
    const data = calculatePanchang(currentDate, location.lat, location.lon, location.elevation);
    setPanchang(data);
    setIsOfflineData(false);
    // Auto-cache current day
    if (isOnline) storageService.savePanchangData(currentDate, data);
  }, [currentDate, location, isOnline]);

  useEffect(() => {
    const birthDate = new Date(`${birthDetails.date}T${birthDetails.time}`);
    const data = calculatePanchang(birthDate, birthDetails.lat, birthDetails.lon, location.elevation);
    setBirthPanchang(data);
  }, [birthDetails]);

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: Compass },
    { id: 'calendar', label: t.calendar, icon: CalendarIcon },
    { id: 'panchang', label: t.panchang, icon: Sun },
    { id: 'muhurta', label: t.muhurta, icon: Clock },
    { id: 'pujavrat', label: t.pujavrat, icon: BookOpen },
    { id: 'festivals', label: t.festivals, icon: Map },
    { id: 'vedicwatch', label: 'Vedic Watch', icon: Clock2 },
    { id: 'install', label: 'Mobile App', icon: Smartphone },
    { id: 'share', label: 'Share App', icon: Share2 },
    { id: 'kundali', label: t.kundali, icon: Star },
    { id: 'astrologers', label: t.astrologers, icon: Users },
    { id: 'offline', label: t.offline, icon: Download },
    { id: 'profile', label: language === 'hi' ? 'प्रोफ़ाइल' : 'Profile', icon: User },
    { id: 'settings', label: (t as any).notifications, icon: Bell },
    { id: 'widget', label: 'Widget Preview', icon: Layout },
    { id: 'karmakanda', label: t.library, icon: Library },
    { id: 'about', label: t.about, icon: InfoIcon },
    { id: 'testing', label: 'Testing Center', icon: Layout },
  ];

  const renderProfile = () => {
    const [name, setName] = useState(userProfile?.name || '');
    const [bDate, setBDate] = useState(userProfile?.birthDate || format(new Date(), 'yyyy-MM-dd'));
    const [bTime, setBTime] = useState(userProfile?.birthTime || format(new Date(), 'HH:mm'));
    const [bLocName, setBLocName] = useState(userProfile?.birthLocation.name || 'Dehradun, UK');
    const [bLat, setBLat] = useState(userProfile?.birthLocation.lat || location.lat);
    const [bLon, setBLon] = useState(userProfile?.birthLocation.lon || location.lon);
    const [savedNotice, setSavedNotice] = useState<string | null>(null);

    const handleSave = () => {
      const p: UserProfile = {
        name,
        birthDate: bDate,
        birthTime: bTime,
        birthLocation: {
          name: bLocName,
          lat: Number(bLat),
          lon: Number(bLon)
        }
      };
      profileService.saveProfile(p);
      setUserProfile(p);
      setBirthDetails({
        date: p.birthDate,
        time: p.birthTime,
        lat: p.birthLocation.lat,
        lon: p.birthLocation.lon
      });
      setSavedNotice(language === 'hi' ? '✓ प्रोफ़ाइल सफलतापूर्वक सुरक्षित की गई!' : '✓ Profile saved successfully!');
      setTimeout(() => setSavedNotice(null), 3000);
    };

    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-serif italic text-rose-gold-500">{language === 'hi' ? 'मेरी प्रोफ़ाइल' : 'My Profile'}</h2>
          <p className="text-[10px] text-rose-gold-100/40 uppercase tracking-widest mt-1">
            {language === 'hi' ? 'जन्म विवरण और सेटिंग्स' : 'Birth Details & Settings'}
          </p>
        </div>

        {savedNotice && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center rounded-xl font-hindi"
          >
            {savedNotice}
          </motion.div>
        )}

        <div className="spiritual-card p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-rose-gold-100/40 tracking-widest px-1">
              {language === 'hi' ? 'आपका नाम' : 'Your Name'}
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-rose-gold-900/20 border border-rose-gold-500/20 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-gold-500 text-rose-gold-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-rose-gold-100/40 tracking-widest px-1">
                {language === 'hi' ? 'जन्म तिथि' : 'Birth Date'}
              </label>
              <input 
                type="date" 
                value={bDate}
                onChange={(e) => setBDate(e.target.value)}
                className="w-full bg-rose-gold-900/20 border border-rose-gold-500/20 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-gold-500 text-rose-gold-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-rose-gold-100/40 tracking-widest px-1">
                {language === 'hi' ? 'जन्म समय' : 'Birth Time'}
              </label>
              <input 
                type="time" 
                value={bTime}
                onChange={(e) => setBTime(e.target.value)}
                className="w-full bg-rose-gold-900/20 border border-rose-gold-500/20 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-gold-500 text-rose-gold-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-rose-gold-100/40 tracking-widest px-1">
              {language === 'hi' ? 'जन्म स्थान का नाम' : 'Birth Location Name'}
            </label>
            <input 
              type="text" 
              value={bLocName}
              onChange={(e) => setBLocName(e.target.value)}
              placeholder="e.g. Dehradun"
              className="w-full bg-rose-gold-900/20 border border-rose-gold-500/20 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-gold-500 text-rose-gold-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-rose-gold-100/40 tracking-widest px-1">Latitude (°N)</label>
              <input 
                type="number" 
                step="any"
                value={bLat}
                onChange={(e) => setBLat(parseFloat(e.target.value))}
                className="w-full bg-rose-gold-900/20 border border-rose-gold-500/20 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-gold-500 text-rose-gold-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-rose-gold-100/40 tracking-widest px-1">Longitude (°E)</label>
              <input 
                type="number" 
                step="any"
                value={bLon}
                onChange={(e) => setBLon(parseFloat(e.target.value))}
                className="w-full bg-rose-gold-900/20 border border-rose-gold-500/20 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-gold-500 text-rose-gold-100"
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-4 mt-4 saffron-gradient text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <User size={18} />
            {language === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save Profile'}
          </button>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif italic">{(t as any).notifications}</h2>
        <p className="text-[10px] text-rose-gold-100/40 uppercase tracking-widest mt-1">{(t as any).notificationDesc}</p>
      </div>

      <div className="spiritual-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center text-saffron">
              <Bell size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">{(t as any).notificationEnabled}</p>
              <p className="text-[10px] text-rose-gold-100/40">Daily Panchang Alerts</p>
            </div>
          </div>
          <button 
            onClick={() => setNotificationSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative",
              notificationSettings.enabled ? "bg-emerald-500" : "bg-slate-300"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
              notificationSettings.enabled ? "left-7" : "left-1"
            )} />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-rose-gold-100/40 tracking-widest px-1">{(t as any).notificationTime}</label>
          <input 
            type="time" 
            value={notificationSettings.time}
            onChange={(e) => setNotificationSettings(prev => ({ ...prev, time: e.target.value }))}
            className="w-full bg-rose-gold-900/20 border border-rose-gold-500/20 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-gold-500 text-rose-gold-100"
          />
        </div>

        <button 
          onClick={async () => {
            await saveNotificationSettings(notificationSettings, language);
            alert('Settings Saved!');
          }}
          className="w-full py-4 saffron-gradient text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
        >
          {(t as any).saveSettings}
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-4 space-y-8">
      {/* Widget at the top of Dashboard */}
      <PanchangWidget panchang={panchang} language={language} date={currentDate} />

      {/* Personal & Calendric Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: User Profile */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase text-rose-gold-100/40 tracking-widest px-1">
            {language === 'hi' ? 'मेरी प्रोफ़ाइल' : 'My Birth Profile'}
          </h3>
          {userProfile ? (
            <div 
              onClick={() => setView('profile')}
              className="spiritual-card p-4 flex items-center justify-between gap-4 bg-rose-gold-950/20 border-rose-gold-500/20 hover:border-saffron/40 transition-all cursor-pointer relative overflow-hidden h-28"
            >
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-saffron/5 to-transparent pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full saffron-gradient flex items-center justify-center text-white shadow-md shadow-saffron/20 shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-gold-100">{userProfile.name}</h4>
                  <p className="text-[10px] text-rose-gold-100/60 mt-0.5">
                    {userProfile.birthDate} • {userProfile.birthTime}
                  </p>
                  <p className="text-[10px] text-rose-gold-100/40 font-medium truncate max-w-[150px]">
                    {userProfile.birthLocation.name}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-rose-gold-100/40" />
            </div>
          ) : (
            <div 
              onClick={() => setView('profile')}
              className="spiritual-card p-4 flex flex-col justify-between bg-rose-gold-950/30 border border-dashed border-rose-gold-500/30 hover:border-saffron/50 transition-all cursor-pointer h-28"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-gold-500/10 flex items-center justify-center text-rose-gold-400 shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-gold-100">
                    {language === 'hi' ? 'प्रोफ़ाइल बनाएं' : 'Create Birth Profile'}
                  </h4>
                  <p className="text-[9px] text-rose-gold-100/50 leading-tight mt-0.5">
                    {language === 'hi' ? 'कुंडली रिपोर्ट और पंचांग के लिए जन्म विवरण भरें।' : 'Enter birth details for personalized Kundali calculation.'}
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-saffron uppercase tracking-wider flex items-center gap-0.5 mt-auto">
                {language === 'hi' ? 'सेट अप करें' : 'Set Up Profile'} <ChevronRight size={10} />
              </span>
            </div>
          )}
        </div>

        {/* Card 2: Vedic Calendar Quick-Link with Current Maas */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase text-rose-gold-100/40 tracking-widest px-1">
            {language === 'hi' ? 'वैदिक कैलेंडर' : 'Vedic Calendar'}
          </h3>
          <div 
            onClick={() => setView('calendar')}
            className="spiritual-card p-4 flex flex-col justify-between bg-saffron/5 border-[#ea580c]/20 hover:border-[#ea580c]/50 transition-all cursor-pointer h-28 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-saffron/10 to-transparent pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center text-saffron shrink-0">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-gold-100">
                  {language === 'hi' ? 'वैदिक मास व तिथियाँ' : 'Vedic Months & Tithis'}
                </h4>
                <p className="text-[9px] text-rose-gold-100/50 leading-tight mt-0.5 truncate">
                  {language === 'hi' ? 'मास फ़िल्टर द्वारा पूरे हिंदू मास के त्योहार देखें।' : 'Filter by Month to see festivals and moon phases.'}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-end mt-auto">
              <span className="text-[9px] font-bold text-saffron uppercase tracking-wider flex items-center gap-0.5">
                {language === 'hi' ? 'कैलेंडर खोलें' : 'Open Calendar'} <ChevronRight size={10} />
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-saffron/10 text-saffron border border-saffron/20 text-xs">
                {panchang ? (language === 'hi' ? 'अमान्त' : 'Amanta') : '2026-27'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Library Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h3 className="text-sm font-bold uppercase text-rose-gold-100/40 tracking-widest">{t.library}</h3>
          <button onClick={() => setView('karmakanda')} className="text-[10px] font-bold text-rose-gold-500 uppercase tracking-wider">View All</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setView('karmakanda')}
            className="spiritual-card p-4 flex items-center gap-3 bg-saffron/5 border-saffron/20"
          >
            <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center text-saffron">
              <Flame size={20} />
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-bold uppercase text-rose-gold-100/40">Aarties</span>
              <span className="block text-sm font-hindi font-bold">आरती संग्रह</span>
            </div>
          </button>
          <button 
            onClick={() => setView('karmakanda')}
            className="spiritual-card p-4 flex items-center gap-3 bg-emerald-50 border-emerald-100"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Sparkles size={20} />
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-bold uppercase text-rose-gold-100/40">Poojan</span>
              <span className="block text-sm font-hindi font-bold">पूजन विधि</span>
            </div>
          </button>
        </div>
      </div>

      {deferredPrompt && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="spiritual-card p-4 bg-emerald-600 text-white flex items-center justify-between gap-4 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Install App</p>
              <p className="text-[10px] opacity-80">Get the full mobile experience</p>
            </div>
          </div>
          <button 
            onClick={handleInstallClick}
            className="px-4 py-2 bg-white text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm"
          >
            Install
          </button>
        </motion.div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase text-rose-gold-100/40 tracking-widest px-1">All Features</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {menuItems.filter(item => !['dashboard', 'karmakanda', 'testing', 'widget'].includes(item.id)).map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView(item.id as View)}
              className="aspect-square spiritual-card flex flex-col items-center justify-center gap-2 p-3 text-rose-gold-100 hover:text-rose-gold-500 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-rose-gold-900/20 border border-rose-gold-500/10 flex items-center justify-center text-rose-gold-500 shadow-sm">
                <item.icon size={20} />
              </div>
              <span className="text-[9px] font-bold uppercase text-center leading-tight text-rose-gold-100/60">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPanchang = () => (
    <div className="p-4 space-y-6">
      <div className="spiritual-card p-6 bg-rose-gold-900/20 border-rose-gold-500/20 text-rose-gold-100">
        <h2 className="text-3xl font-serif italic mb-2 text-rose-gold-500">{t.varas[currentDate.getDay()]}</h2>
        <p className="text-sm opacity-90 font-hindi text-rose-gold-100/60">{t.system}</p>
        <div className="mt-4 flex justify-between items-end">
          <div>
            <p className="text-lg font-hindi text-rose-gold-100">
              {panchang ? (panchang.tithi.index < 15 ? t.pakshas[0] : t.pakshas[1]) : ''} {panchang ? t.tithis[panchang.tithi.index] : ''}
            </p>
            <p className="text-xs opacity-75 text-rose-gold-100/60">Tithi Progress: {Math.round((panchang?.tithi.progress || 0) * 100)}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-hindi text-rose-gold-100">Nakshatra: {panchang ? t.nakshatras[panchang.nakshatra.index % 27] : ''}</p>
            <p className="text-sm font-hindi text-rose-gold-100">Yoga: {panchang ? t.yogas[panchang.yoga.index % 27] : ''}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="spiritual-card p-3 flex flex-col items-center justify-center text-center">
          <p className="text-[9px] uppercase text-rose-gold-100/40 font-bold tracking-wider mb-1">{t.gate}</p>
          <p className="text-sm font-hindi font-bold text-rose-gold-500">{panchang?.gate}</p>
        </div>
        <div className="spiritual-card p-3 flex flex-col items-center justify-center text-center">
          <p className="text-[9px] uppercase text-rose-gold-100/40 font-bold tracking-wider mb-1">{t.lagna}</p>
          <p className="text-sm font-hindi font-bold text-rose-gold-500">{panchang ? (language === 'hi' ? t.rashis[panchang.lagna.index] : panchang.lagna.name) : ''}</p>
        </div>
        <div className="spiritual-card p-3 flex flex-col items-center justify-center text-center">
          <p className="text-[9px] uppercase text-rose-gold-100/40 font-bold tracking-wider mb-1">{t.rashi}</p>
          <p className="text-sm font-hindi font-bold text-rose-gold-500">{panchang ? (language === 'hi' ? t.rashis[panchang.rashi.index] : panchang.rashi.name) : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="spiritual-card p-4 flex items-center gap-3">
          <Sun className="text-rose-gold-500" size={20} />
          <div>
            <p className="text-[10px] uppercase text-rose-gold-100/40">{t.sunrise}</p>
            <p className="text-sm font-bold text-rose-gold-100">{panchang ? format(panchang.sunrise, 'hh:mm a') : '--:--'}</p>
            {panchang && (
              <p className="text-[9px] text-rose-gold-300/60">
                {Math.round(panchang.sunriseAzimuth)}° {getCardinalDirection(panchang.sunriseAzimuth)}
              </p>
            )}
          </div>
        </div>
        <div className="spiritual-card p-4 flex items-center gap-3">
          <Moon className="text-indigo-400" size={20} />
          <div>
            <p className="text-[10px] uppercase text-rose-gold-100/40">{t.moonrise}</p>
            <p className="text-sm font-bold text-rose-gold-100">{panchang?.moonrise ? format(panchang.moonrise, 'hh:mm a') : 'No Rise'}</p>
            {panchang?.moonriseAzimuth !== null && panchang?.moonriseAzimuth !== undefined && (
              <p className="text-[9px] text-rose-gold-300/60">
                {Math.round(panchang.moonriseAzimuth)}° {getCardinalDirection(panchang.moonriseAzimuth)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="spiritual-card p-6 space-y-4">
        <h3 className="font-serif italic text-xl border-b border-rose-gold-500/20 pb-2 text-rose-gold-500">{t.ishtaKaal}</h3>
        <div className="flex justify-around text-center">
          <div>
            <p className="text-2xl font-hindi text-rose-gold-500">{panchang?.ishtaKaal.ghati}</p>
            <p className="text-[10px] uppercase text-rose-gold-100/40">{t.ghati}</p>
          </div>
          <div>
            <p className="text-2xl font-hindi text-rose-gold-500">{panchang?.ishtaKaal.pala}</p>
            <p className="text-[10px] uppercase text-rose-gold-100/40">{t.pala}</p>
          </div>
          <div>
            <p className="text-2xl font-hindi text-rose-gold-500">{panchang?.ishtaKaal.vikal}</p>
            <p className="text-[10px] uppercase text-rose-gold-100/40">{t.vikal}</p>
          </div>
        </div>
        <p className="text-[10px] text-center italic text-rose-gold-100/30">Calculated from local sunrise: {panchang ? format(panchang.sunrise, 'hh:mm:ss a') : ''}</p>
      </div>
    </div>
  );

  const renderMuhurta = () => (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif italic text-rose-gold-500">{t.dailyMuhurtas}</h2>
        <p className="text-[10px] text-rose-gold-100/40 uppercase tracking-widest mt-1">Auspicious & Inauspicious Timings</p>
        {panchang && (
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-rose-gold-500/10 border border-rose-gold-500/20 rounded-full">
            <span className="text-[10px] font-bold text-rose-gold-300 uppercase tracking-tighter">{t.gate}:</span>
            <span className="text-sm font-bold text-rose-gold-100">{panchang.gate}</span>
          </div>
        )}
      </div>

      {/* Day Chart Visualization */}
      <div className="spiritual-card p-4 space-y-4">
        <h3 className="text-sm font-bold uppercase text-rose-gold-100/60 flex items-center gap-2">
          <Layout size={16} />
          {language === 'hi' ? 'दिन का चार्ट' : 'Day Chart'}
        </h3>
        <div className="relative h-12 bg-rose-gold-900/20 rounded-full overflow-hidden flex border border-rose-gold-500/10">
          {panchang?.muhurtaTable.map((m, idx) => {
            const dayStart = panchang.sunrise.getTime() - 2 * 3600000;
            const dayEnd = panchang.sunset.getTime() + 2 * 3600000;
            const total = dayEnd - dayStart;
            const left = ((m.start.getTime() - dayStart) / total) * 100;
            const width = ((m.end.getTime() - m.start.getTime()) / total) * 100;
            return (
              <div 
                key={idx}
                className={cn(
                  "absolute h-full transition-all hover:brightness-110 cursor-help",
                  m.type === 'shubh' ? "bg-emerald-400/60" : 
                  m.type === 'special' ? "bg-saffron/80" : "bg-red-400/60"
                )}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${m.name}: ${format(m.start, 'HH:mm')} - ${format(m.end, 'HH:mm')}`}
              />
            );
          })}
          {/* Sunrise/Sunset Markers */}
          {panchang && (() => {
            const dayStart = panchang.sunrise.getTime() - 2 * 3600000;
            const dayEnd = panchang.sunset.getTime() + 2 * 3600000;
            const total = dayEnd - dayStart;
            const sunrisePos = ((panchang.sunrise.getTime() - dayStart) / total) * 100;
            const sunsetPos = ((panchang.sunset.getTime() - dayStart) / total) * 100;
            return (
              <>
                <div className="absolute top-0 bottom-0 w-0.5 bg-saffron z-20" style={{ left: `${sunrisePos}%` }} />
                <div className="absolute top-0 bottom-0 w-0.5 bg-indigo-600 z-20" style={{ left: `${sunsetPos}%` }} />
              </>
            );
          })()}
        </div>
        <div className="flex justify-between text-[8px] text-rose-gold-100/40 font-bold uppercase">
          <span>{format(new Date(panchang?.sunrise.getTime()! - 2 * 3600000), 'HH:mm')}</span>
          <span>{format(panchang?.sunrise!, 'HH:mm')} Sunrise</span>
          <span>{format(panchang?.sunset!, 'HH:mm')} Sunset</span>
          <span>{format(new Date(panchang?.sunset.getTime()! + 2 * 3600000), 'HH:mm')}</span>
        </div>
      </div>

      {/* Muhurta Table */}
      <div className="spiritual-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-rose-gold-500/10 text-rose-gold-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-3">{language === 'hi' ? 'मुहूर्त' : 'Muhurta'}</th>
              <th className="p-3">{language === 'hi' ? 'समय' : 'Timing'}</th>
              <th className="p-3 text-right">{language === 'hi' ? 'प्रकार' : 'Type'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-gold-500/10">
            {panchang?.muhurtaTable.map((m, idx) => (
              <tr key={idx} className={cn(
                m.type === 'shubh' ? "bg-emerald-500/5" : 
                m.type === 'special' ? "bg-saffron/10" : "bg-red-500/5"
              )}>
                <td className="p-3 font-bold text-rose-gold-100">{language === 'hi' ? m.nameHi : m.name}</td>
                <td className="p-3 font-hindi text-rose-gold-100/80">{format(m.start, 'hh:mm a')} - {format(m.end, 'hh:mm a')}</td>
                <td className="p-3 text-right">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase",
                    m.type === 'shubh' ? "bg-emerald-500/20 text-emerald-400" : 
                    m.type === 'special' ? "bg-saffron/20 text-saffron" : "bg-red-500/20 text-red-400"
                  )}>
                    {m.type === 'shubh' ? (language === 'hi' ? 'शुभ' : 'Shubh') : 
                     m.type === 'special' ? (language === 'hi' ? 'विशेष' : 'Special') :
                     (language === 'hi' ? 'अशुभ' : 'Ashubh')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chaughadiya Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase text-rose-gold-100/60 px-2">{language === 'hi' ? 'चौघड़िया' : 'Chaughadiya'}</h3>
        <div className="spiritual-card overflow-hidden">
          <div className="grid grid-cols-2 gap-px bg-rose-gold-500/10">
            {panchang?.chaughadiya.map((c, idx) => (
              <div key={idx} className={cn(
                "p-3 flex flex-col gap-1",
                c.type === 'shubh' ? "bg-emerald-500/5" : c.type === 'ashubh' ? "bg-red-500/5" : "bg-rose-gold-900/20"
              )}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-rose-gold-100">{language === 'hi' ? c.nameHi : c.name}</span>
                  <span className={cn(
                    "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded",
                    c.type === 'shubh' ? "bg-emerald-500/20 text-emerald-400" : c.type === 'ashubh' ? "bg-red-500/20 text-red-400" : "bg-slate-500/20 text-slate-400"
                  )}>
                    {c.type}
                  </span>
                </div>
                <span className="text-[10px] text-rose-gold-100/50 font-hindi">
                  {format(c.start, 'hh:mm a')} - {format(c.end, 'hh:mm a')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hora Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase text-rose-gold-100/60 px-2">{language === 'hi' ? 'होरा' : 'Hora'}</h3>
        <div className="spiritual-card max-h-60 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <tbody className="divide-y divide-rose-gold-500/10">
              {panchang?.hora.map((h, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-bold text-rose-gold-100">{language === 'hi' ? h.nameHi : h.name}</td>
                  <td className="p-3 font-hindi text-rose-gold-100/60">{format(h.start, 'hh:mm a')} - {format(h.end, 'hh:mm a')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lagna Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase text-rose-gold-100/60 px-2">{language === 'hi' ? 'लग्न तालिका' : 'Lagna Table'}</h3>
        <div className="spiritual-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <tbody className="divide-y divide-rose-gold-500/10">
              {panchang?.lagnaTable.map((l, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-bold text-rose-gold-100">{language === 'hi' ? l.nameHi : l.name}</td>
                  <td className="p-3 font-hindi text-rose-gold-100/60">{format(l.start, 'hh:mm a')} - {format(l.end, 'hh:mm a')}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <span className="text-[10px] bg-rose-gold-500/10 px-2 py-1 rounded text-rose-gold-100/60 font-bold">
                {format(new Date(2026, fest.month, fest.day), 'MMM dd')}
              </span>
            </div>
            <p className="text-xs text-rose-gold-100/70 mt-1 italic">
              {language === 'hi' ? fest.descriptionHi : fest.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderKundali = () => (
    <div className="p-4 space-y-6 pb-10">
      <div className="text-center">
        <h2 className="text-2xl font-serif italic text-rose-gold-500">{t.janmaKundali}</h2>
        <p className="text-xs text-rose-gold-100/40 uppercase tracking-widest mt-1">{t.northIndianStyle}</p>
      </div>

      {/* Birth Details Inputs */}
      <div className="spiritual-card p-4 grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-rose-gold-100/40">{language === 'hi' ? 'जन्म तिथि' : 'Birth Date'}</label>
          <input 
            type="date" 
            value={birthDetails.date}
            onChange={(e) => setBirthDetails(prev => ({ ...prev, date: e.target.value }))}
            className="w-full bg-rose-gold-900/20 border border-rose-gold-500/20 rounded-lg p-2 text-sm focus:outline-none focus:border-rose-gold-500 text-rose-gold-100"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-rose-gold-100/40">{language === 'hi' ? 'जन्म समय' : 'Birth Time'}</label>
          <input 
            type="time" 
            value={birthDetails.time}
            onChange={(e) => setBirthDetails(prev => ({ ...prev, time: e.target.value }))}
            className="w-full bg-rose-gold-900/20 border border-rose-gold-500/20 rounded-lg p-2 text-sm focus:outline-none focus:border-rose-gold-500 text-rose-gold-100"
          />
        </div>
      </div>

      <NorthIndianChart 
        birthDetails={birthDetails} 
        planets={birthPanchang?.planets || []}
        language={language}
      />

      <div className="spiritual-card p-4 text-xs space-y-2 italic text-rose-gold-100/60">
        <p>• Ayanamsa: Lahiri (Chitrapaksha)</p>
        <p>• {language === 'hi' ? 'स्थान' : 'Location'}: {location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E</p>
        <p>• {language === 'hi' ? 'ऊंचाई' : 'Elevation'}: {location.elevation.toFixed(0)}m (Himalayan Adjusted)</p>
      </div>
    </div>
  );

  const renderInstall = () => (
    <div className="p-4 space-y-6">
      <div className="spiritual-card p-6 bg-rose-gold-900/20 border-rose-gold-500/20 text-rose-gold-100 text-center space-y-4">
        <div className="w-20 h-20 bg-rose-gold-500/10 rounded-3xl mx-auto flex items-center justify-center shadow-inner border border-rose-gold-500/20">
          <Smartphone size={40} className="text-rose-gold-500" />
        </div>
        <h2 className="text-2xl font-serif italic font-bold text-rose-gold-500">{(t as any).installTitle}</h2>
        <p className="text-sm opacity-90 leading-relaxed text-rose-gold-100/70">{(t as any).installDesc}</p>
      </div>

      <div className="space-y-4">
        <div className="spiritual-card p-5 border-emerald-100 bg-emerald-50/50">
          <div className="flex items-center gap-3 mb-3 text-emerald-700">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="font-bold">A</span>
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wider">Android</h3>
          </div>
          <p className="text-xs text-ink/70 leading-relaxed">{(t as any).installAndroid}</p>
        </div>

        <div className="spiritual-card p-5 border-blue-100 bg-blue-50/50">
          <div className="flex items-center gap-3 mb-3 text-blue-700">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="font-bold">i</span>
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wider">iOS (iPhone)</h3>
          </div>
          <p className="text-xs text-ink/70 leading-relaxed">{(t as any).installIOS}</p>
        </div>
      </div>

      {deferredPrompt && (
        <button 
          onClick={handleInstallClick}
          className="w-full py-4 saffron-gradient text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
        >
          Install Now
        </button>
      )}
    </div>
  );

  const renderCalendar = () => {
    const selectedPanchang = calculatePanchang(currentDate, location.lat, location.lon, location.elevation);
    const selectedVrats = getPujaVratForDate(selectedPanchang);

    const HINDU_MONTHS_2026 = [
      { name: 'Chaitra (चैत्र)', nameHi: 'चैत्र', date: new Date(2026, 2, 20) },
      { name: 'Vaishakha (वैशाख)', nameHi: 'वैशाख', date: new Date(2026, 3, 18) },
      { name: 'Jyeshtha (ज्येष्ठ)', nameHi: 'ज्येष्ठ', date: new Date(2026, 4, 18) },
      { name: 'Ashadha (आषाढ़)', nameHi: 'आषाढ़', date: new Date(2026, 5, 16) },
      { name: 'Shravana (श्रावण)', nameHi: 'श्रावण', date: new Date(2026, 6, 16) },
      { name: 'Bhadrapada (भाद्रपद)', nameHi: 'भाद्रपद', date: new Date(2026, 7, 14) },
      { name: 'Ashvina (आश्विन)', nameHi: 'आश्विन', date: new Date(2026, 8, 12) },
      { name: 'Kartika (कार्तिक)', nameHi: 'कार्तिक', date: new Date(2026, 9, 12) },
      { name: 'Margashirsha (मार्गशीर्ष)', nameHi: 'मार्गशीर्ष', date: new Date(2026, 10, 10) },
      { name: 'Pausha (पौष)', nameHi: 'पौष', date: new Date(2026, 11, 10) },
      { name: 'Magha (माघ)', nameHi: 'माघ', date: new Date(2027, 0, 8) },
      { name: 'Phalguna (फाल्गुन)', nameHi: 'फाल्गुन', date: new Date(2027, 1, 7) },
    ];

    return (
      <div className="p-4 space-y-6">
        <div className="spiritual-card p-4 space-y-3">
          <label className="text-[10px] font-bold uppercase text-rose-gold-100/40 tracking-widest px-1">
            {language === 'hi' ? 'मास चुनें (2026-27)' : 'Filter by Maas (2026-27)'}
          </label>
          <select 
            onChange={(e) => {
              if (e.target.value !== "") {
                const parts = e.target.value.split('-');
                setCurrentDate(new Date(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])));
              }
            }}
            className="w-full bg-rose-gold-900/40 border border-rose-gold-500/30 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-gold-500 text-rose-gold-100 font-hindi"
          >
            <option value="">{language === 'hi' ? '-- मास चुनें --' : '-- Select Maas --'}</option>
            {HINDU_MONTHS_2026.map(m => (
              <option key={m.name} value={`${m.date.getFullYear()}-${m.date.getMonth()}-${m.date.getDate()}`}>
                {language === 'hi' ? m.nameHi : m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="spiritual-card p-2">
          <Calendar 
            onChange={(val) => setCurrentDate(val as Date)} 
            value={currentDate}
            className="w-full border-none font-sans"
            tileClassName={({ date }) => {
              const isFest = UTTARAKHAND_FESTIVALS.some(f => f.month === date.getMonth() && f.day === date.getDate());
              return isFest ? 'bg-rose-gold-500/20 text-rose-gold-500 font-bold rounded-xl' : '';
            }}
            tileContent={({ date, view }) => {
              if (view !== 'month') return null;
              const d = calculatePanchang(date, location.lat, location.lon, location.elevation);
              const tithi = d.tithi.index;
              const isWaxing = tithi < 15;
              const progress = isWaxing ? (tithi + 1) / 15 : (30 - tithi) / 15;
              const paksha = isWaxing ? t.pakshas[0] : t.pakshas[1];
              
              return (
                <div className="!absolute !inset-0 flex flex-col justify-between p-1.5 z-10 pointer-events-none overflow-hidden">
                  {/* Moon Phase Background */}
                  <div className="absolute inset-0 flex items-center justify-center z-0 opacity-80">
                    <div className="w-[120%] aspect-square rounded-full relative transition-all duration-700 overflow-hidden">
                      {/* The Moon Base */}
                      <div className="absolute inset-0 bg-white/95" />
                      
                      {/* The Phase Shadow - Standard horizontal sweep */}
                      <div 
                        className="absolute inset-0 bg-[#0a0502] transition-transform duration-700 ease-in-out"
                        style={{
                          transform: `translateX(${isWaxing ? (1 - progress) * 110 : -(1 - progress) * 110}%)`,
                        }}
                      />
                      
                      {/* Full Moon Glow */}
                      {tithi === 14 && (
                        <div className="absolute inset-0 bg-white/20 blur-xl animate-pulse" />
                      )}
                    </div>
                  </div>
                  
                  {/* Info Layers */}
                  <div className="flex justify-between items-start z-10 w-full px-0.5">
                    <span className="text-sm font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {date.getDate()}
                    </span>
                    <span className="text-[7px] font-bold text-rose-gold-100 bg-black/60 px-1 rounded-sm border border-white/10 uppercase">
                      {paksha}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-0.5 z-10">
                    <div className="text-[9px] font-black bg-rose-gold-600 text-[#0a0502] px-2 rounded-sm shadow-md ring-1 ring-black/40">
                      G: {d.gate}
                    </div>
                    <div className="text-[6px] font-bold opacity-30 text-white tracking-widest uppercase text-center w-full">
                      T:{d.tithi.index + 1}
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </div>

        {/* Detailed View for Selected Date */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="spiritual-card p-6 bg-rose-gold-900/20 border-rose-gold-500/20 text-rose-gold-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-serif italic text-xl text-rose-gold-500">{format(currentDate, 'EEEE, MMMM dd')}</h3>
                <p className="text-xs opacity-60 font-hindi uppercase tracking-widest">{t.system}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-hindi text-rose-gold-300">
                  {selectedPanchang.tithi.index < 15 ? t.pakshas[0] : t.pakshas[1]} {t.tithis[selectedPanchang.tithi.index]}
                </p>
                <p className="text-[10px] opacity-50 uppercase tracking-tighter">Gate: {selectedPanchang.gate}</p>
              </div>
            </div>

            {/* Festivals/Vrats for selected date */}
            {UTTARAKHAND_FESTIVALS.find(f => f.month === currentDate.getMonth() && f.day === currentDate.getDate()) && (
              <div className="mb-4 bg-rose-gold-500/20 p-3 rounded-xl border border-rose-gold-500/30">
                <p className="text-sm font-bold text-rose-gold-100 flex items-center gap-2">
                  <Sparkles size={16} className="text-rose-gold-500" />
                  {UTTARAKHAND_FESTIVALS.find(f => f.month === currentDate.getMonth() && f.day === currentDate.getDate())?.name}
                </p>
                <p className="text-[10px] text-rose-gold-100/60 mt-1 italic">
                  {language === 'hi' 
                    ? UTTARAKHAND_FESTIVALS.find(f => f.month === currentDate.getMonth() && f.day === currentDate.getDate())?.descriptionHi 
                    : UTTARAKHAND_FESTIVALS.find(f => f.month === currentDate.getMonth() && f.day === currentDate.getDate())?.description}
                </p>
              </div>
            )}

            {selectedVrats.length > 0 && (
              <div className="mb-4 space-y-2">
                {selectedVrats.map((vrat, idx) => (
                  <div key={idx} className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <p className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Flame size={16} />
                      {language === 'hi' ? vrat.nameHi : vrat.name}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-rose-gold-500/10">
              <div className="space-y-1">
                <p className="text-[9px] uppercase text-rose-gold-100/40 font-bold tracking-widest">Nakshatra</p>
                <p className="text-sm font-hindi">{t.nakshatras[selectedPanchang.nakshatra.index % 27]}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[9px] uppercase text-rose-gold-100/40 font-bold tracking-widest">Yoga</p>
                <p className="text-sm font-hindi">{t.yogas[selectedPanchang.yoga.index % 27]}</p>
              </div>
            </div>
          </div>

          {/* Shubh/Ashubh Timings for Selected Date */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase text-rose-gold-100/40 tracking-widest px-2">Auspicious & Inauspicious Timings</h4>
            <div className="grid grid-cols-2 gap-3">
              {selectedPanchang.muhurtaTable.filter(m => m.name.includes('Abhijit') || m.name.includes('Rahu') || m.name.includes('Gulika')).map((m, idx) => (
                <div key={idx} className={cn(
                  "spiritual-card p-3 border-l-4",
                  m.type === 'shubh' ? "border-l-emerald-500 bg-emerald-500/5" : "border-l-red-500 bg-red-500/5"
                )}>
                  <p className="text-[10px] font-bold uppercase opacity-60 mb-1">{language === 'hi' ? m.nameHi : m.name}</p>
                  <p className="text-xs font-bold text-rose-gold-100">{format(m.start, 'hh:mm a')} - {format(m.end, 'hh:mm a')}</p>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setView('panchang')}
            className="w-full py-4 bg-rose-gold-500/10 border border-rose-gold-500/20 text-rose-gold-500 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-rose-gold-500/20 transition-colors"
          >
            View Full Daily Panchang
          </button>
        </motion.div>
      </div>
    );
  };

  const renderOffline = () => {
    const cachedDates = Object.keys(storageService.getAllCached());
    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-serif italic text-rose-gold-500">{t.offlineMode}</h2>
          <p className="text-[10px] text-rose-gold-100/40 uppercase tracking-widest mt-1">Access Panchang anywhere</p>
        </div>

        <div className="spiritual-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-rose-gold-100">{t.downloadData}</h3>
            <Download className="text-rose-gold-500" size={20} />
          </div>
          <p className="text-xs text-rose-gold-100/60 italic">Download Panchang for the current and next month to use without internet.</p>
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
            <h3 className="font-bold text-sm text-rose-gold-100">{t.cachedData}</h3>
            <span className="text-[10px] bg-rose-gold-500/10 px-2 py-1 rounded-full text-rose-gold-100/40 font-bold">{cachedDates.length} Days</span>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
            {cachedDates.sort().map(date => (
              <div key={date} className="flex justify-between items-center text-xs p-2 bg-rose-gold-900/30 rounded-lg text-rose-gold-100/80">
                <span>{date}</span>
                <span className="text-emerald-400 font-bold">{t.offlineReady}</span>
              </div>
            ))}
            {cachedDates.length === 0 && <p className="text-center text-xs text-rose-gold-100/30 italic">{t.noData}</p>}
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
        <h2 className="text-2xl font-serif italic text-rose-gold-500">{t.aboutTitle}</h2>
        <p className="text-[10px] text-rose-gold-100/40 uppercase tracking-widest mt-1">Technical Details</p>
      </div>
      <div className="spiritual-card p-6 space-y-4">
        <p className="text-sm leading-relaxed text-rose-gold-100/80">
          {t.aboutDesc}
        </p>
        <div className="pt-4 border-t border-rose-gold-500/10 space-y-4">
          <div className="bg-rose-gold-500/5 p-3 rounded-lg border border-rose-gold-500/10">
            <h4 className="text-xs font-bold uppercase text-rose-gold-500 mb-1">{language === 'hi' ? 'एंड्रॉइड पर इंस्टॉल करें' : 'Install on Android'}</h4>
            <p className="text-[10px] text-rose-gold-100/70 italic">
              {language === 'hi' 
                ? 'इस ऐप को अपने होम स्क्रीन पर जोड़ने के लिए ब्राउज़र मेनू में "Add to Home Screen" पर टैप करें।' 
                : 'Tap "Add to Home Screen" in your browser menu to install this app on your device.'}
            </p>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-rose-gold-100/40">Month End</span>
            <span className="font-bold text-rose-gold-500">Amavasya (New Moon)</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-rose-gold-100/40">Ayanamsa</span>
            <span className="font-bold text-rose-gold-500">Lahiri (Chitrapaksha)</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-rose-gold-100/40">Era</span>
            <span className="font-bold text-rose-gold-500">Vikram Samvat</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWidgetPreview = () => (
    <div className="p-4 space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif italic text-rose-gold-500">Home Screen Widget</h2>
        <p className="text-xs text-rose-gold-100/40 uppercase tracking-widest">Glanceable Daily Panchang</p>
      </div>
      
      <div className="w-full max-w-[300px] aspect-square">
        <PanchangWidget panchang={panchang} language={language} date={currentDate} />
      </div>

      <div className="spiritual-card p-6 w-full max-w-sm space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2 text-rose-gold-500">
          <InfoIcon size={16} />
          How to add to Home Screen
        </h3>
        <ol className="text-xs text-rose-gold-100/70 space-y-2 list-decimal pl-4">
          <li>Tap the 'Share' or 'Menu' button in your browser.</li>
          <li>Select 'Add to Home Screen'.</li>
          <li>The app icon will appear on your device home screen for quick access.</li>
        </ol>
      </div>
    </div>
  );

  const renderKarmakanda = () => (
    <SpiritualLibrary language={language} />
  );

  const renderTestingCenter = () => (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif italic text-rose-gold-500">Testing Center</h2>
        <p className="text-[10px] text-rose-gold-100/40 uppercase tracking-widest mt-1">Android Version Verification</p>
      </div>

      <div className="spiritual-card p-4 space-y-4">
        <h3 className="text-sm font-bold uppercase text-rose-gold-100/60">Quick Jump Dates</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Makar Sankranti 2026', date: new Date(2026, 0, 14) },
            { label: 'Phool Dei 2026', date: new Date(2026, 2, 14) },
            { label: 'Harela 2026', date: new Date(2026, 6, 16) },
            { label: 'Today', date: new Date() }
          ].map((test, idx) => (
            <button 
              key={idx}
              onClick={() => {
                setCurrentDate(test.date);
                setView('panchang');
              }}
              className="p-3 bg-rose-gold-500/10 hover:bg-rose-gold-500/20 rounded-lg text-xs font-bold text-rose-gold-500 transition-colors"
            >
              {test.label}
            </button>
          ))}
        </div>
      </div>

      <div className="spiritual-card p-4 space-y-2">
        <h3 className="text-sm font-bold uppercase text-rose-gold-100/60">PWA Status</h3>
        <div className="flex items-center justify-between text-xs text-rose-gold-100/80">
          <span>Service Worker:</span>
          <span className="text-emerald-400 font-bold">Registered</span>
        </div>
        <div className="flex items-center justify-between text-xs text-rose-gold-100/80">
          <span>Install Prompt:</span>
          <span className={cn("font-bold", deferredPrompt ? "text-emerald-600" : "text-red-500")}>
            {deferredPrompt ? 'Available' : 'Not Triggered'}
          </span>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full mt-2 py-2 border border-saffron/20 text-saffron rounded-lg text-[10px] font-bold uppercase tracking-widest"
        >
          Force Refresh App
        </button>
        {deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            className="w-full mt-4 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Install Android App
          </button>
        )}
      </div>
    </div>
  );

    return (
    <div className="min-h-screen bg-[#0a0502] font-sans text-rose-gold-100 pb-20">
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0a0502] flex flex-col items-center justify-center p-10 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-32 h-32 bg-saffron rounded-full flex items-center justify-center shadow-2xl mb-6 relative"
            >
              <Sun size={64} className="text-white animate-pulse" />
              <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-ping" />
            </motion.div>
            <h1 className="font-serif text-4xl italic font-bold text-rose-gold-500 mb-2">Siddhidatri</h1>
            <p className="text-rose-gold-100/40 uppercase tracking-[0.3em] text-[10px] font-bold">Uttarakhand Vedic Panchang</p>
            <div className="mt-20 flex items-center gap-2 text-rose-gold-100/20">
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#100A06]/80 backdrop-blur-lg border-b border-rose-gold-500/10 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Menu size={22} className="text-rose-gold-100/70" />
          </button>
          <button onClick={() => setView('karmakanda')} className="p-2 hover:bg-white/5 rounded-full transition-colors text-rose-gold-500 relative group">
            <Library size={22} />
            <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#100A06]" />
          </button>
        </div>
        <div className="text-center">
          <h1 className="font-serif text-lg italic font-bold text-rose-gold-500 tracking-tight leading-none">{t.appName}</h1>
          <div className="flex items-center justify-center gap-1 text-[8px] text-rose-gold-100/30 uppercase tracking-widest mt-0.5">
            <MapPin size={8} />
            <span>Uttarakhand</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setView('profile')}
            className={cn(
              "p-2 rounded-full transition-colors relative", 
              view === 'profile' ? "text-saffron bg-[#ea580c]/10" : "text-rose-gold-100/70 hover:bg-white/5"
            )}
            title={language === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}
          >
            {userProfile ? (
              <div className="relative">
                <User size={18} className="text-[#ea580c]" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-[#100A06]" />
              </div>
            ) : (
              <User size={18} />
            )}
          </button>
          <button 
            onClick={handleShare}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-rose-gold-500"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => setLanguage(prev => prev === 'en' ? 'hi' : 'en')}
            className="px-2 py-1 bg-white/5 border border-rose-gold-500/10 rounded-lg text-rose-gold-500 hover:bg-rose-gold-500/10 transition-colors flex items-center gap-1"
          >
            <Languages size={14} />
            <span className="text-[9px] font-bold uppercase">{language === 'en' ? 'हिन्दी' : 'EN'}</span>
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
            {view === 'profile' && renderProfile()}
            {view === 'settings' && renderSettings()}
            {view === 'about' && renderAbout()}
            {view === 'widget' && renderWidgetPreview()}
            {view === 'karmakanda' && renderKarmakanda()}
            {view === 'testing' && renderTestingCenter()}
            {view === 'install' && renderInstall()}
            {view === 'vedicwatch' && panchang && <VedicWatch sunrise={panchang.sunrise} language={language} panchang={panchang} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#100A06] rounded-3xl p-6 z-[101] shadow-2xl border border-rose-gold-500/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif italic font-bold text-saffron-dark">Share Siddhidatri</h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-black/5 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-rose-gold-500/5 rounded-2xl border border-rose-gold-500/10 flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full saffron-gradient flex items-center justify-center text-white shadow-lg">
                    <Share2 size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-rose-gold-100">Public Access Link</p>
                    <p className="text-[10px] text-rose-gold-100/40 uppercase tracking-widest">Share this with anyone</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase text-rose-gold-100/40 tracking-widest px-1">App URL</p>
                  <div className="flex gap-2">
                    <input 
                      readOnly 
                      value={getPublicUrl()} 
                      className="flex-1 bg-rose-gold-900/20 border border-rose-gold-500/10 rounded-xl px-4 py-3 text-xs font-mono text-rose-gold-100/60 outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(getPublicUrl());
                        alert('Link copied to clipboard!');
                      }}
                      className="px-4 py-3 bg-saffron text-white rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-transform"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] text-emerald-800 font-bold leading-relaxed">
                    Note: This link is the public version of your app. Anyone with this link can view the Panchang.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
              className="fixed inset-y-0 left-0 w-72 bg-[#100A06] z-[70] shadow-2xl p-6 flex flex-col border-r border-rose-gold-500/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-serif italic text-2xl text-rose-gold-500">Siddhidatri</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X size={24} className="text-rose-gold-100/70" />
                </button>
              </div>
              <nav className="space-y-2 flex-grow">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'share') {
                        handleShare();
                      } else {
                        setView(item.id as View);
                      }
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl transition-all font-semibold",
                      view === item.id 
                        ? "bg-rose-gold-500 text-[#100A06] shadow-lg" 
                        : "hover:bg-rose-gold-500/10 text-rose-gold-100/70"
                    )}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </button>
                ))}
                {deferredPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center gap-4 p-4 rounded-xl transition-all font-bold bg-emerald-600 text-white shadow-lg mt-4"
                  >
                    <Download size={20} />
                    <span>Install App</span>
                  </button>
                )}
              </nav>
              <div className="mt-auto pt-6 border-t border-rose-gold-500/10 text-[10px] text-rose-gold-100/30 text-center uppercase tracking-widest">
                {t.version}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Quick Nav (Mobile Style) */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#100A06]/80 backdrop-blur-lg border-t border-rose-gold-500/10 px-6 py-3 flex justify-between items-center z-40">
        <button 
          onClick={() => setView('dashboard')}
          className={cn("flex flex-col items-center gap-1", view === 'dashboard' ? "text-rose-gold-500" : "text-rose-gold-100/60")} 
        >
          <Compass size={20} />
          <span className="text-[10px] font-bold uppercase">{t.home}</span>
        </button>
        <button 
          onClick={() => setView('panchang')}
          className={cn("flex flex-col items-center gap-1", view === 'panchang' ? "text-rose-gold-500" : "text-rose-gold-100/60")} 
        >
          <Sun size={20} />
          <span className="text-[10px] font-bold uppercase">{t.panchang}</span>
        </button>
        <button 
          onClick={() => setView('calendar')}
          className={cn("flex flex-col items-center gap-1", view === 'calendar' ? "text-rose-gold-500" : "text-rose-gold-100/60")} 
        >
          <CalendarIcon size={20} />
          <span className="text-[10px] font-bold uppercase">{t.calendar}</span>
        </button>
        <button 
          onClick={() => setView('kundali')}
          className={cn("flex flex-col items-center gap-1", view === 'kundali' ? "text-rose-gold-500" : "text-rose-gold-100/60")} 
        >
          <Star size={20} />
          <span className="text-[10px] font-bold uppercase">{t.kundali}</span>
        </button>
        <button 
          onClick={() => setView('karmakanda')}
          className={cn("flex flex-col items-center gap-1", view === 'karmakanda' ? "text-rose-gold-500" : "text-rose-gold-100/60")} 
        >
          <Library size={20} />
          <span className="text-[10px] font-bold uppercase">{t.library}</span>
        </button>
      </nav>
    </div>
  );
}
