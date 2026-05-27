import { 
  Observer, 
  Body, 
  SearchRiseSet, 
  AstroTime,
  GeoVector,
  Ecliptic,
  MoonPhase,
  Horizon,
  Equator
} from 'astronomy-engine';

export interface PanchangData {
  tithi: { name: string; index: number; progress: number };
  nakshatra: { name: string; index: number; progress: number };
  yoga: { name: string; index: number; progress: number };
  karana: { name: string; index: number; progress: number };
  vara: string;
  sunrise: Date;
  sunriseAzimuth: number;
  sunset: Date;
  sunsetAzimuth: number;
  moonrise: Date | null;
  moonriseAzimuth: number | null;
  moonset: Date | null;
  moonsetAzimuth: number | null;
  rahukaal: { start: Date; end: Date };
  gulikakaal: { start: Date; end: Date };
  abhijit: { start: Date; end: Date };
  ishtaKaal: { ghati: number; pala: number; vikal: number };
  rashi: { name: string; index: number };
  lagna: { name: string; index: number; longitude: number };
  gate: number;
  sunLong: number;
  planets: { name: string; nameHi: string; longitude: number; house: number }[];
  chaughadiya: { name: string; nameHi: string; start: Date; end: Date; type: 'shubh' | 'ashubh' | 'neutral' }[];
  hora: { name: string; nameHi: string; start: Date; end: Date }[];
  lagnaTable: { name: string; nameHi: string; start: Date; end: Date }[];
  muhurtaTable: { name: string; nameHi: string; start: Date; end: Date; type: 'shubh' | 'ashubh' | 'special' }[];
}

const TITHIS = [
  "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti", "Saptami", "Ashtami",
  "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
];

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const YOGAS = [
  "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula",
  "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha",
  "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

const KARANAS = [
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kintughna"
];

const VARAS = ["Ravivara", "Somavara", "Mangalavara", "Budhavara", "Guruvara", "Shukravara", "Shanivara"];

const CHAUGHADIYA_ORDER = {
  "Ravivara": ["Udveg", "Chara", "Labha", "Amrita", "Kaala", "Shubha", "Roga", "Udveg"],
  "Somavara": ["Amrita", "Kaala", "Shubha", "Roga", "Udveg", "Chara", "Labha", "Amrita"],
  "Mangalavara": ["Roga", "Udveg", "Chara", "Labha", "Amrita", "Kaala", "Shubha", "Roga"],
  "Budhavara": ["Labha", "Amrita", "Kaala", "Shubha", "Roga", "Udveg", "Chara", "Labha"],
  "Guruvara": ["Shubha", "Roga", "Udveg", "Chara", "Labha", "Amrita", "Kaala", "Shubha"],
  "Shukravara": ["Chara", "Labha", "Amrita", "Kaala", "Shubha", "Roga", "Udveg", "Chara"],
  "Shanivara": ["Kaala", "Shubha", "Roga", "Udveg", "Chara", "Labha", "Amrita", "Kaala"]
};

const CHAUGHADIYA_NIGHT_ORDER = {
  "Ravivara": ["Shubha", "Amrita", "Chara", "Roga", "Kaala", "Labha", "Udveg", "Shubha"],
  "Somavara": ["Chara", "Roga", "Kaala", "Labha", "Udveg", "Shubha", "Amrita", "Chara"],
  "Mangalavara": ["Kaala", "Labha", "Udveg", "Shubha", "Amrita", "Chara", "Roga", "Kaala"],
  "Budhavara": ["Udveg", "Shubha", "Amrita", "Chara", "Roga", "Kaala", "Labha", "Udveg"],
  "Guruvara": ["Amrita", "Chara", "Roga", "Kaala", "Labha", "Udveg", "Shubha", "Amrita"],
  "Shukravara": ["Roga", "Kaala", "Labha", "Udveg", "Shubha", "Amrita", "Chara", "Roga"],
  "Shanivara": ["Labha", "Udveg", "Shubha", "Amrita", "Chara", "Roga", "Kaala", "Labha"]
};

const HORA_ORDER = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
const HORA_ORDER_HI = ["सूर्य", "शुक्र", "बुध", "चंद्र", "शनि", "गुरु", "मंगल"];

const CHAUGHADIYA_NAMES_HI: Record<string, string> = {
  "Udveg": "उद्वेग",
  "Chara": "चर",
  "Labha": "लाभ",
  "Amrita": "अमृत",
  "Kaala": "काल",
  "Shubha": "शुभ",
  "Roga": "रोग"
};

const MUHURTAS = [
  { name: "Rudra", nameHi: "रुद्र", type: "ashubh" },
  { name: "Ahi", nameHi: "अहि", type: "ashubh" },
  { name: "Mitra", nameHi: "मित्र", type: "shubh" },
  { name: "Pitri", nameHi: "पितृ", type: "ashubh" },
  { name: "Vasu", nameHi: "वसु", type: "shubh" },
  { name: "Vara", nameHi: "वारा", type: "shubh" },
  { name: "Vishvadeva", nameHi: "विश्वेदेवा", type: "shubh" },
  { name: "Vidhi", nameHi: "विधि", type: "shubh" },
  { name: "Satamukhi", nameHi: "सतमुखी", type: "shubh" },
  { name: "Puruhuta", nameHi: "पुरुहूत", type: "shubh" },
  { name: "Vahni", nameHi: "वह्नि", type: "ashubh" },
  { name: "Naktanchara", nameHi: "नक्तंचर", type: "ashubh" },
  { name: "Varuna", nameHi: "वरुण", type: "shubh" },
  { name: "Aryaman", nameHi: "अर्यमन", type: "shubh" },
  { name: "Bhaga", nameHi: "भग", type: "ashubh" }
];

const RASHIS_HI = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"];

const CHAUGHADIYA_TYPES: Record<string, 'shubh' | 'ashubh' | 'neutral'> = {
  "Amrita": "shubh",
  "Shubha": "shubh",
  "Labha": "shubh",
  "Chara": "shubh",
  "Udveg": "ashubh",
  "Roga": "ashubh",
  "Kaala": "ashubh"
};

function getAyanamsa(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const fraction = (month * 30 + day) / 365.25;
  return 23.853056 + (year + fraction - 2000) * 0.0139697;
}

export function calculatePanchang(date: Date, lat: number, lon: number, elevation: number = 0): PanchangData {
  const observer = new Observer(lat, lon, elevation);
  const time = new AstroTime(date);

  // Find the sunrise for the current Hindu day
  let searchDate = new Date(date);
  searchDate.setHours(0, 0, 0, 0);
  let timeStartOfDay = new AstroTime(searchDate);

  let sunrise = SearchRiseSet(Body.Sun, observer, 1, timeStartOfDay, 1);
  let sunset = SearchRiseSet(Body.Sun, observer, -1, timeStartOfDay, 1);

  // If current time is before today's sunrise, we belong to the previous Hindu day
  if (sunrise && sunrise.date.getTime() > date.getTime()) {
    searchDate.setDate(searchDate.getDate() - 1);
    timeStartOfDay = new AstroTime(searchDate);
    sunrise = SearchRiseSet(Body.Sun, observer, 1, timeStartOfDay, 1);
    sunset = SearchRiseSet(Body.Sun, observer, -1, timeStartOfDay, 1);
  }

  // Fallback for extreme latitudes (not typical for India, but safe)
  if (!sunrise) sunrise = { date: new Date(searchDate.getTime() + 6 * 3600000) } as any;
  if (!sunset) sunset = { date: new Date(searchDate.getTime() + 18 * 3600000) } as any;

  const moonrise = SearchRiseSet(Body.Moon, observer, 1, timeStartOfDay, 1);
  const moonset = SearchRiseSet(Body.Moon, observer, -1, timeStartOfDay, 1);

  // Calculate Azimuths
  const sunriseEq = Equator(Body.Sun, new AstroTime(sunrise.date), observer, true, true);
  const sunsetEq = Equator(Body.Sun, new AstroTime(sunset.date), observer, true, true);
  const moonriseEq = moonrise ? Equator(Body.Moon, new AstroTime(moonrise.date), observer, true, true) : null;
  const moonsetEq = moonset ? Equator(Body.Moon, new AstroTime(moonset.date), observer, true, true) : null;

  const sunriseHor = Horizon(new AstroTime(sunrise.date), observer, sunriseEq.ra, sunriseEq.dec, "normal");
  const sunsetHor = Horizon(new AstroTime(sunset.date), observer, sunsetEq.ra, sunsetEq.dec, "normal");
  const moonriseHor = moonrise && moonriseEq ? Horizon(new AstroTime(moonrise.date), observer, moonriseEq.ra, moonriseEq.dec, "normal") : null;
  const moonsetHor = moonset && moonsetEq ? Horizon(new AstroTime(moonset.date), observer, moonsetEq.ra, moonsetEq.dec, "normal") : null;

  const ayanamsa = getAyanamsa(date);
  
  const sunVec = GeoVector(Body.Sun, time, true);
  const sunEcl = Ecliptic(sunVec);
  const sunLong = (sunEcl.elon - ayanamsa + 360) % 360;

  const moonVec = GeoVector(Body.Moon, time, true);
  const moonEcl = Ecliptic(moonVec);
  const moonLong = (moonEcl.elon - ayanamsa + 360) % 360;

  let diff = (moonLong - sunLong + 360) % 360;
  const tithiIndex = Math.floor(diff / 12);
  const tithiName = tithiIndex < 15 ? TITHIS[tithiIndex] : TITHIS[tithiIndex - 15];
  const tithiType = tithiIndex < 15 ? "Shukla" : "Krishna";
  const fullTithiName = `${tithiType} ${tithiName}`;

  const nakIndex = Math.floor(moonLong / (360 / 27));
  const nakName = NAKSHATRAS[nakIndex % 27];

  const yogaIndex = Math.floor(((sunLong + moonLong) % 360) / (360 / 27));
  const yogaName = YOGAS[yogaIndex % 27];

  const karanaIndex = Math.floor(diff / 6);
  const karanaName = KARANAS[karanaIndex % 11];

  // The Hindu day (Vara) changes at sunrise, so use searchDate
  const hinduDayOfWeek = searchDate.getDay();
  const vara = VARAS[hinduDayOfWeek];

  const dayDuration = (sunset.date.getTime() - sunrise.date.getTime());

  const rahuTable = [16.5, 7.5, 15, 12, 13.5, 10.5, 9];
  const rahuStartOffset = (rahuTable[hinduDayOfWeek] - 6) * (dayDuration / 12);
  const rahuStart = new Date(sunrise.date.getTime() + rahuStartOffset);
  const rahuEnd = new Date(rahuStart.getTime() + (dayDuration / 8));

  const gulikaTable = [15, 13.5, 12, 10.5, 9, 7.5, 6];
  const gulikaStartOffset = (gulikaTable[hinduDayOfWeek] - 6) * (dayDuration / 12);
  const gulikaStart = new Date(sunrise.date.getTime() + gulikaStartOffset);
  const gulikaEnd = new Date(gulikaStart.getTime() + (dayDuration / 8));

  const midday = sunrise.date.getTime() + (dayDuration / 2);
  const abhijitStart = new Date(midday - (dayDuration / 30));
  const abhijitEnd = new Date(midday + (dayDuration / 30));

  const diffMs = date.getTime() - sunrise.date.getTime();
  const totalGhati = (diffMs / (24 * 60 * 1000));
  const ghati = Math.floor(totalGhati);
  const totalPala = (totalGhati - ghati) * 60;
  const pala = Math.floor(totalPala);
  const vikal = Math.floor((totalPala - pala) * 60);

  // Calculate Rashi (Moon Sign)
  const rashiIndex = Math.floor(moonLong / 30);
  const RASHIS = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
  const rashiName = RASHIS[rashiIndex % 12];

  // Calculate Gate (Solar Day)
  const currentSunSign = Math.floor(sunLong / 30);
  let sDate = new Date(date);
  let sankrantiTime = sDate.getTime();
  
  for (let i = 0; i <= 32; i++) {
    const tTime = new AstroTime(sDate);
    const tSunVec = GeoVector(Body.Sun, tTime, true);
    const tSunEcl = Ecliptic(tSunVec);
    const tAyanamsa = getAyanamsa(sDate);
    const tSunLong = (tSunEcl.elon - tAyanamsa + 360) % 360;
    
    if (Math.floor(tSunLong / 30) !== currentSunSign) {
      // Binary search for exact Sankranti time
      let left = sDate.getTime();
      let right = left + 86400000;
      
      for (let step = 0; step < 15; step++) {
        const mid = (left + right) / 2;
        const mTime = new AstroTime(new Date(mid));
        const mSunVec = GeoVector(Body.Sun, mTime, true);
        const mSunEcl = Ecliptic(mSunVec);
        const mAyanamsa = getAyanamsa(new Date(mid));
        const mSunLong = (mSunEcl.elon - mAyanamsa + 360) % 360;
        
        if (Math.floor(mSunLong / 30) !== currentSunSign) {
          left = mid;
        } else {
          right = mid;
        }
      }
      sankrantiTime = right;
      break;
    }
    sDate.setDate(sDate.getDate() - 1);
  }

  const sankrantiDateObj = new Date(sankrantiTime);
  
  // Force IST timezone for calculation
  const targetDateMidnight = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  targetDateMidnight.setHours(0,0,0,0);
  const sankrantiDateMidnight = new Date(sankrantiDateObj.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  sankrantiDateMidnight.setHours(0,0,0,0);
  
  const gate = Math.round((targetDateMidnight.getTime() - sankrantiDateMidnight.getTime()) / 86400000) + 1;

  // Calculate Lagna (Ascendant)
  // Using exact spherical trigonometry for sidereal ascendant
  const t = (date.getTime() / 86400000 - 10957.5) / 36525;
  let gmst = 280.46061837 + 360.98564736629 * (date.getTime() / 86400000 - 10957.5) + 0.000387933 * t * t - t * t * t / 38710000;
  gmst = ((gmst % 360) + 360) % 360;
  const lmst = (gmst + lon) % 360;
  const rad = Math.PI / 180;
  const e = 23.4392911 * rad;
  const ramc = lmst * rad;
  const latRad = lat * rad;
  let asc = Math.atan2(Math.cos(ramc), -Math.sin(ramc) * Math.cos(e) - Math.tan(latRad) * Math.sin(e)) / rad;
  asc = ((asc % 360) + 360) % 360;
  const siderealAsc = (asc - ayanamsa + 360) % 360;
  const lagnaIndex = Math.floor(siderealAsc / 30);
  const lagnaName = RASHIS[lagnaIndex % 12];

  // Calculate all planets
  const planetBodies = [
    { body: Body.Sun, name: "Sun", nameHi: "सूर्य" },
    { body: Body.Moon, name: "Moon", nameHi: "चंद्र" },
    { body: Body.Mars, name: "Mars", nameHi: "मंगल" },
    { body: Body.Mercury, name: "Mercury", nameHi: "बुध" },
    { body: Body.Jupiter, name: "Jupiter", nameHi: "गुरु" },
    { body: Body.Venus, name: "Venus", nameHi: "शुक्र" },
    { body: Body.Saturn, name: "Saturn", nameHi: "शनि" }
  ];

  const planets = planetBodies.map(p => {
    const vec = GeoVector(p.body, time, true);
    const ecl = Ecliptic(vec);
    const long = (ecl.elon - ayanamsa + 360) % 360;
    const house = (Math.floor(long / 30) - lagnaIndex + 12) % 12 + 1;
    return { name: p.name, nameHi: p.nameHi, longitude: long, house };
  });

  // Rahu/Ketu (Approximate)
  const rahuLong = (MoonPhase(time) * 360 / 28 + 180) % 360; // Very rough approximation for demo
  const ketuLong = (rahuLong + 180) % 360;
  planets.push({ name: "Rahu", nameHi: "राहु", longitude: rahuLong, house: (Math.floor(rahuLong / 30) - lagnaIndex + 12) % 12 + 1 });
  planets.push({ name: "Ketu", nameHi: "केतु", longitude: ketuLong, house: (Math.floor(ketuLong / 30) - lagnaIndex + 12) % 12 + 1 });

  // Chaughadiya Calculation
  const nightDuration = 86400000 - dayDuration;
  const dayPart = dayDuration / 8;
  const nightPart = nightDuration / 8;
  
  const CHAUGHADIYA_ORDER = {
    "Ravivara": ["Udveg", "Chara", "Labha", "Amrita", "Kala", "Shubha", "Roga", "Udveg"],
    "Somavara": ["Amrita", "Kala", "Shubha", "Roga", "Udveg", "Chara", "Labha", "Amrita"],
    "Mangalavara": ["Roga", "Udveg", "Chara", "Labha", "Amrita", "Kala", "Shubha", "Roga"],
    "Budhavara": ["Labha", "Amrita", "Kala", "Shubha", "Roga", "Udveg", "Chara", "Labha"],
    "Guruvara": ["Shubha", "Roga", "Udveg", "Chara", "Labha", "Amrita", "Kala", "Shubha"],
    "Shukravara": ["Chara", "Labha", "Amrita", "Kala", "Shubha", "Roga", "Udveg", "Chara"],
    "Shanivara": ["Kala", "Shubha", "Roga", "Udveg", "Chara", "Labha", "Amrita", "Kala"]
  };

  const CHAUGHADIYA_NAMES_HI: Record<string, string> = {
    "Udveg": "उद्वेग", "Chara": "चर", "Labha": "लाभ", "Amrita": "अमृत", "Kala": "काल", "Shubha": "शुभ", "Roga": "रोग"
  };

  const CHAUGHADIYA_TYPES: Record<string, 'shubh' | 'ashubh' | 'neutral'> = {
    "Udveg": "ashubh", "Chara": "neutral", "Labha": "shubh", "Amrita": "shubh", "Kala": "ashubh", "Shubha": "shubh", "Roga": "ashubh"
  };

  const chaughadiya: PanchangData['chaughadiya'] = [];
  const dayOrder = CHAUGHADIYA_ORDER[vara as keyof typeof CHAUGHADIYA_ORDER];
  
  for (let i = 0; i < 8; i++) {
    const start = new Date(sunrise.date.getTime() + i * dayPart);
    const end = new Date(sunrise.date.getTime() + (i + 1) * dayPart);
    chaughadiya.push({
      name: dayOrder[i],
      nameHi: CHAUGHADIYA_NAMES_HI[dayOrder[i]],
      type: CHAUGHADIYA_TYPES[dayOrder[i]],
      start,
      end
    });
  }

  // Hora Calculation
  const HORA_ORDER = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
  const HORA_NAMES_HI: Record<string, string> = {
    "Sun": "सूर्य", "Venus": "शुक्र", "Mercury": "बुध", "Moon": "चंद्र", "Saturn": "शनि", "Jupiter": "गुरु", "Mars": "मंगल"
  };
  const hora: PanchangData['hora'] = [];
  const dayHoraPart = dayDuration / 12;
  const startHoraIndex = HORA_ORDER.indexOf(vara.replace("vara", "").replace("Ravi", "Sun").replace("Soma", "Moon").replace("Mangala", "Mars").replace("Budha", "Mercury").replace("Guru", "Jupiter").replace("Shukra", "Venus").replace("Shani", "Saturn"));
  
  for (let i = 0; i < 24; i++) {
    const duration = i < 12 ? dayDuration / 12 : nightDuration / 12;
    const baseTime = i < 12 ? sunrise.date.getTime() : sunset.date.getTime();
    const offset = i < 12 ? i * (dayDuration / 12) : (i - 12) * (nightDuration / 12);
    const hIdx = (startHoraIndex + i) % 7;
    hora.push({
      name: HORA_ORDER[hIdx],
      nameHi: HORA_NAMES_HI[HORA_ORDER[hIdx]],
      start: new Date(baseTime + offset),
      end: new Date(baseTime + offset + duration)
    });
  }

  // Lagna Table Calculation
  const lagnaTable: PanchangData['lagnaTable'] = [];
  const RASHIS_HI = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"];
  for (let i = 0; i < 12; i++) {
    const checkTime = new Date(sunrise.date.getTime() + i * 2 * 3600000);
    const tCheck = (checkTime.getTime() / 86400000 - 10957.5) / 36525;
    let gmstCheck = 280.46061837 + 360.98564736629 * (checkTime.getTime() / 86400000 - 10957.5) + 0.000387933 * tCheck * tCheck;
    gmstCheck = ((gmstCheck % 360) + 360) % 360;
    const lmstCheck = (gmstCheck + lon) % 360;
    const ramcCheck = lmstCheck * rad;
    let ascCheck = Math.atan2(Math.cos(ramcCheck), -Math.sin(ramcCheck) * Math.cos(e) - Math.tan(latRad) * Math.sin(e)) / rad;
    ascCheck = ((ascCheck % 360) + 360) % 360;
    const sAscCheck = (ascCheck - ayanamsa + 360) % 360;
    const lIdx = Math.floor(sAscCheck / 30);
    lagnaTable.push({
      name: RASHIS[lIdx % 12],
      nameHi: RASHIS_HI[lIdx % 12],
      start: checkTime,
      end: new Date(checkTime.getTime() + 2 * 3600000)
    });
  }

  // Muhurta Table
  const muhurtaTable: PanchangData['muhurtaTable'] = [
    { name: "Brahma Muhurta", nameHi: "ब्रह्म मुहूर्त", start: new Date(sunrise.date.getTime() - 96 * 60000), end: new Date(sunrise.date.getTime() - 48 * 60000), type: 'shubh' },
    { name: "Abhijit Muhurta", nameHi: "अभिजित मुहूर्त", start: abhijitStart, end: abhijitEnd, type: 'shubh' },
    { name: "Rahu Kaal", nameHi: "राहु काल", start: rahuStart, end: rahuEnd, type: 'ashubh' },
    { name: "Gulika Kaal", nameHi: "गुुलिका काल", start: gulikaStart, end: gulikaEnd, type: 'ashubh' },
    { name: "Yamaganda Kaal", nameHi: "यमगण्ड काल", start: new Date(sunrise.date.getTime() + (dayDuration / 8) * 4), end: new Date(sunrise.date.getTime() + (dayDuration / 8) * 5), type: 'ashubh' }
  ];

  // Sarvartha Siddhi Yoga Detection
  const SSY_RULES: Record<string, string[]> = {
    "Ravivara": ["Ashwini", "Rohini", "Mrigashira", "Pushya", "Hasta", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada", "Shravana"],
    "Somavara": ["Rohini", "Mrigashira", "Pushya", "Anuradha", "Shravana"],
    "Mangalavara": ["Ashwini", "Krittika", "Mrigashira", "Jyeshtha"],
    "Budhavara": ["Rohini", "Mrigashira", "Hasta", "Anuradha", "Dhanishta"],
    "Guruvara": ["Ashwini", "Punarvasu", "Pushya", "Anuradha", "Revati"],
    "Shukravara": ["Ashwini", "Bharani", "Anuradha", "Shravana", "Revati"],
    "Shanivara": ["Rohini", "Shravana", "Dhanishta"]
  };

  if (SSY_RULES[vara]?.includes(nakName)) {
    muhurtaTable.push({
      name: "Sarvartha Siddhi Yoga",
      nameHi: "सर्वार्थ सिद्धि योग",
      // For simplicity, we show it as active for the day period
      start: sunrise.date,
      end: sunset.date,
      type: 'special'
    });
  }

  return {
    tithi: { name: fullTithiName, index: tithiIndex, progress: (diff % 12) / 12 },
    nakshatra: { name: nakName, index: nakIndex, progress: (moonLong % (360 / 27)) / (360 / 27) },
    yoga: { name: yogaName, index: yogaIndex, progress: ((sunLong + moonLong) % (360 / 27)) / (360 / 27) },
    karana: { name: karanaName, index: karanaIndex, progress: (diff % 6) / 6 },
    vara,
    sunrise: sunrise.date,
    sunriseAzimuth: sunriseHor.azimuth,
    sunset: sunset.date,
    sunsetAzimuth: sunsetHor.azimuth,
    moonrise: moonrise?.date || null,
    moonriseAzimuth: moonriseHor?.azimuth || null,
    moonset: moonset?.date || null,
    moonsetAzimuth: moonsetHor?.azimuth || null,
    rahukaal: { start: rahuStart, end: rahuEnd },
    gulikakaal: { start: gulikaStart, end: gulikaEnd },
    abhijit: { start: abhijitStart, end: abhijitEnd },
    ishtaKaal: { ghati, pala, vikal },
    rashi: { name: rashiName, index: rashiIndex },
    lagna: { name: lagnaName, index: lagnaIndex, longitude: siderealAsc },
    gate,
    sunLong,
    planets,
    chaughadiya,
    hora,
    lagnaTable,
    muhurtaTable
  };
}

export const UTTARAKHAND_FESTIVALS = [
  { 
    name: "Phool Dei", 
    nameHi: "फूल देई",
    month: 2, 
    day: 14, 
    description: "Harvest festival where children decorate doorsteps with flowers.",
    descriptionHi: "फसल उत्सव जहाँ बच्चे फूलों से देहरी सजाते हैं।"
  },
  { 
    name: "Harela", 
    nameHi: "हरेला",
    month: 6, 
    day: 16, 
    description: "Kumaoni festival marking the beginning of the monsoon.",
    descriptionHi: "कुमाऊँनी पर्व जो मानसून के आगमन का प्रतीक है।"
  },
  { 
    name: "Ghughuti (Makar Sankranti)", 
    nameHi: "घुघुती (मकर संक्रांति)",
    month: 0, 
    day: 14, 
    description: "Festival where deep-fried sweets are offered to crows.",
    descriptionHi: "त्योहार जहाँ कौवों को मीठे पकवान अर्पित किए जाते हैं।"
  },
  { 
    name: "Khatarua", 
    nameHi: "खतड़ुआ",
    month: 8, 
    day: 17, 
    description: "Victory festival celebrated with bonfires.",
    descriptionHi: "विजयोत्सव जिसे अलाव जलाकर मनाया जाता है।"
  },
  { 
    name: "Nanda Devi Raj Jat", 
    nameHi: "नंदा देवी राज जात",
    month: 7, 
    day: 25, 
    description: "Major pilgrimage honoring Goddess Nanda Devi.",
    descriptionHi: "माँ नंदा देवी के सम्मान में आयोजित विशाल तीर्थयात्रा।"
  }
];

export interface PujaVrat {
  name: string;
  nameHi: string;
  significance: string;
  significanceHi: string;
  rituals: string;
  ritualsHi: string;
  timing: string;
  timingHi: string;
}

export function getPujaVratForDate(panchang: PanchangData): PujaVrat[] {
  const vrats: PujaVrat[] = [];
  
  // Ekadashi (11th tithi of both fortnights)
  if (panchang.tithi.index === 10 || panchang.tithi.index === 25) {
    vrats.push({
      name: "Ekadashi Vrat",
      nameHi: "एकादशी व्रत",
      significance: "Dedicated to Lord Vishnu, considered the most powerful vrat for spiritual cleansing.",
      significanceHi: "भगवान विष्णु को समर्पित, आध्यात्मिक शुद्धि के लिए सर्वाधिक प्रभावशाली व्रत।",
      rituals: "Fast from grains and beans. Chant Vishnu Sahasranama.",
      ritualsHi: "अन्न एवं दालों का त्याग। विष्णु सहस्रनाम का पाठ करें।",
      timing: "Full day fast starting from sunrise.",
      timingHi: "सूर्योदय से प्रारंभ होने वाला पूर्ण दिवस व्रत।"
    });
  }

  // Pradosh Vrat (13th tithi)
  if (panchang.tithi.index === 12 || panchang.tithi.index === 27) {
    vrats.push({
      name: "Pradosh Vrat",
      nameHi: "प्रदोष व्रत",
      significance: "Dedicated to Lord Shiva. Observed for health and prosperity.",
      significanceHi: "भगवान शिव को समर्पित। आरोग्य एवं समृद्धि हेतु किया जाता है।",
      rituals: "Evening puja of Shiva and Parvati.",
      ritualsHi: "शिव एवं पार्वती की सायं काल पूजा।",
      timing: "Sunset period (Sandhya Kaal).",
      timingHi: "सूर्यास्त काल (संध्या काल)।"
    });
  }

  // Purnima
  if (panchang.tithi.index === 14) {
    vrats.push({
      name: "Satyanarayan Puja",
      nameHi: "सत्यनारायण पूजा",
      significance: "Full moon day, auspicious for Satyanarayan Katha.",
      significanceHi: "पूर्णिमा तिथि, सत्यनारायण कथा हेतु अत्यंत शुभ।",
      rituals: "Recitation of Satyanarayan Katha, offering of 'Prasad' (Suji Halwa).",
      ritualsHi: "सत्यनारायण कथा श्रवण, प्रसाद (सूजी का हलवा) वितरण।",
      timing: "Evening or Morning.",
      timingHi: "प्रातः अथवा सायं काल।"
    });
  }

  // Regional specific check (Simplified)
  if (panchang.vara === "Ravivara") {
    vrats.push({
      name: "Surya Dev Puja",
      nameHi: "सूर्य देव पूजा",
      significance: "Weekly dedication to the Sun God, vital in the Himalayas.",
      significanceHi: "सूर्य देव को साप्ताहिक समर्पण, हिमालयी क्षेत्रों में विशेष महत्व।",
      rituals: "Offering water (Arghya) to the Sun at sunrise.",
      ritualsHi: "सूर्योदय के समय सूर्य को अर्घ्य दान।",
      timing: "Sunrise.",
      timingHi: "सूर्योदय काल।"
    });
  }

  return vrats;
}

export function getMoonPhase(date: Date) {
  const time = new AstroTime(date);
  return MoonPhase(time);
}
