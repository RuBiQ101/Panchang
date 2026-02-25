import React, { useState } from 'react';
import { Star, MessageSquare, Phone, Calendar, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { translations, Language } from '../translations';

export interface Astrologer {
  id: string;
  name: string;
  nameHi: string;
  expertise: string[];
  expertiseHi: string[];
  experience: number;
  rating: number;
  price: number;
  image: string;
  isVetted: boolean;
  location: string;
  locationHi: string;
}

const MOCK_ASTROLOGERS: Astrologer[] = [
  {
    id: '1',
    name: 'Acharya Deepesh Nautiyal',
    nameHi: 'आचार्य दीपेश नौटियाल',
    expertise: ['Vedic Astrology', 'Kundali Matching', 'Prashna Shastra'],
    expertiseHi: ['वैदिक ज्योतिष', 'कुंडली मिलान', 'प्रश्न शास्त्र'],
    experience: 15,
    rating: 4.9,
    price: 500,
    image: 'https://picsum.photos/seed/astro1/200/200',
    isVetted: true,
    location: 'Rishikesh, Uttarakhand',
    locationHi: 'ऋषिकेश, उत्तराखंड'
  },
  {
    id: '2',
    name: 'Pandit Rameshwar Bhatt',
    nameHi: 'पंडित रामेश्वर भट्ट',
    expertise: ['Muhurta Selection', 'Vastu Shastra', 'Palmistry'],
    expertiseHi: ['मुहूर्त चयन', 'वास्तु शास्त्र', 'हस्तरेखा'],
    experience: 22,
    rating: 4.8,
    price: 700,
    image: 'https://picsum.photos/seed/astro2/200/200',
    isVetted: true,
    location: 'Almora, Uttarakhand',
    locationHi: 'अल्मोड़ा, उत्तराखंड'
  },
  {
    id: '3',
    name: 'Shastri Meenakshi Negi',
    nameHi: 'शास्त्री मीनाक्षी नेगी',
    expertise: ['Numerology', 'Gemology', 'Career Guidance'],
    expertiseHi: ['अंक ज्योतिष', 'रत्न विज्ञान', 'करियर मार्गदर्शन'],
    experience: 10,
    rating: 4.7,
    price: 400,
    image: 'https://picsum.photos/seed/astro3/200/200',
    isVetted: true,
    location: 'Dehradun, Uttarakhand',
    locationHi: 'देहरादून, उत्तराखंड'
  }
];

interface AstrologerSectionProps {
  language: Language;
}

export const AstrologerSection: React.FC<AstrologerSectionProps> = ({ language }) => {
  const [selectedAstro, setSelectedAstro] = useState<Astrologer | null>(null);
  const t = translations[language];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif italic">{t.consultAstrologers}</h2>
        <div className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">
          <ShieldCheck size={12} />
          <span>{t.vettedExperts}</span>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_ASTROLOGERS.map((astro) => (
          <motion.div
            key={astro.id}
            whileHover={{ y: -2 }}
            className="spiritual-card p-4 flex gap-4"
          >
            <div className="relative">
              <img 
                src={astro.image} 
                alt={astro.name} 
                className="w-20 h-20 rounded-xl object-cover border-2 border-gold/20"
                referrerPolicy="no-referrer"
              />
              {astro.isVetted && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                  <CheckCircle size={10} />
                </div>
              )}
            </div>

            <div className="flex-grow space-y-1">
              <div className="flex justify-between items-start">
                <h3 className="font-hindi font-bold text-ink">
                  {language === 'hi' ? astro.nameHi : astro.name}
                </h3>
                <div className="flex items-center gap-1 text-gold">
                  <Star size={12} fill="currentColor" />
                  <span className="text-xs font-bold">{astro.rating}</span>
                </div>
              </div>
              <p className="text-[10px] text-ink/60 uppercase tracking-wider">
                {(language === 'hi' ? astro.expertiseHi : astro.expertise).join(' • ')}
              </p>
              <p className="text-[10px] text-saffron-dark font-medium italic">
                {language === 'hi' ? astro.locationHi : astro.location}
              </p>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-bold text-ink">₹{astro.price}<span className="text-[10px] font-normal text-ink/40">/session</span></span>
                <div className="flex gap-2">
                  <button className="p-2 bg-parchment text-saffron rounded-lg hover:bg-saffron/10 transition-colors">
                    <MessageSquare size={16} />
                  </button>
                  <button className="p-2 bg-parchment text-saffron rounded-lg hover:bg-saffron/10 transition-colors">
                    <Phone size={16} />
                  </button>
                  <button 
                    onClick={() => setSelectedAstro(astro)}
                    className="px-3 py-1 bg-saffron text-white rounded-lg text-xs font-bold shadow-md hover:bg-saffron-dark transition-colors"
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedAstro && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="spiritual-card w-full max-w-sm p-6 space-y-4"
          >
            <h3 className="text-xl font-serif italic text-center">
              {language === 'hi' ? 'परामर्श हेतु समय चुनें' : 'Book Appointment'}
            </h3>
            <div className="flex items-center gap-4 p-3 bg-parchment rounded-xl">
              <img src={selectedAstro.image} className="w-12 h-12 rounded-lg" alt="" referrerPolicy="no-referrer" />
              <div>
                <p className="font-bold text-sm">
                  {language === 'hi' ? selectedAstro.nameHi : selectedAstro.name}
                </p>
                <p className="text-[10px] text-ink/50 italic">
                  {language === 'hi' ? 'अगला उपलब्ध: आज, ४:०० अपराह्न' : 'Next Available: Today, 4:00 PM'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['4:00 PM', '5:30 PM', '7:00 PM'].map(time => (
                <button key={time} className="p-2 border border-gold/20 rounded-lg text-xs hover:bg-saffron hover:text-white transition-all">
                  {time}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedAstro(null)}
                className="flex-1 py-3 border border-gold/20 rounded-xl text-sm font-bold"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button className="flex-1 py-3 bg-saffron text-white rounded-xl text-sm font-bold shadow-lg">
                {language === 'hi' ? 'पुष्टि करें' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
