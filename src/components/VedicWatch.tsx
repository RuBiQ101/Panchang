import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { translations } from '../translations';
import { PanchangData } from '../services/panchangService';

interface VedicWatchProps {
  sunrise: Date;
  language: 'en' | 'hi';
  panchang: PanchangData;
}

const RASHI_NAMES_HI = translations.hi.rashis;
const RASHI_NAMES_EN = translations.en.rashis;

const RASHI_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const PLANET_METADATA: Record<string, { color: string; size: number; emissiveIntensity: number; labelColor: string; isRahuKetu?: boolean }> = {
  "Sun": { color: "#F27D26", size: 0.22, emissiveIntensity: 2.2, labelColor: "#F27D26" },
  "Moon": { color: "#E2E8F0", size: 0.16, emissiveIntensity: 1.5, labelColor: "#E2E8F0" },
  "Mars": { color: "#ef4444", size: 0.13, emissiveIntensity: 1.8, labelColor: "#f87171" },
  "Mercury": { color: "#60a5fa", size: 0.12, emissiveIntensity: 1.4, labelColor: "#93c5fd" },
  "Jupiter": { color: "#fbbf24", size: 0.19, emissiveIntensity: 2.0, labelColor: "#fde047" },
  "Venus": { color: "#fef08a", size: 0.15, emissiveIntensity: 1.7, labelColor: "#fef9c3" },
  "Saturn": { color: "#b45309", size: 0.17, emissiveIntensity: 1.2, labelColor: "#fbbf24" },
  "Rahu": { color: "#a855f7", size: 0.13, emissiveIntensity: 1.0, labelColor: "#c084fc", isRahuKetu: true },
  "Ketu": { color: "#6366f1", size: 0.13, emissiveIntensity: 1.0, labelColor: "#818cf8", isRahuKetu: true }
};

const PLANET_DISTANCES: Record<string, number> = {
  "Sun": 3.3,
  "Moon": 2.2,
  "Mercury": 2.4,
  "Venus": 2.6,
  "Mars": 2.8,
  "Jupiter": 3.0,
  "Saturn": 3.2,
  "Rahu": 3.5,
  "Ketu": 3.5
};

interface PlanetProps {
  name: string;
  position: [number, number, number];
  color: string;
  size?: number;
  emissiveIntensity?: number;
  labelColor?: string;
  isRahuKetu?: boolean;
}

const Planet = ({ name, position, color, size = 0.12, emissiveIntensity = 1.5, labelColor = "white", isRahuKetu = false }: PlanetProps) => {
  return (
    <group position={position}>
      {/* Glow aura */}
      <mesh>
        <sphereGeometry args={[size * 1.4, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* Primary planet body */}
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={emissiveIntensity} 
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Saturn rings visualization */}
      {name === "Saturn" || name === "शनि" ? (
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[size * 1.5, size * 2.3, 64]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      ) : null}

      {/* Shadow rings/auras for Rahu & Ketu */}
      {isRahuKetu && (
        <mesh rotation={[0, 0, 0]}>
          <ringGeometry args={[size * 1.2, size * 1.35, 32]} />
          <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Label */}
      <Text
        position={[0, -size - 0.15, 0.1]}
        fontSize={0.11}
        color={labelColor}
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
};

const OrbitRing = ({ radius, color = "#E4E3E0" }: { radius: number; color?: string }) => {
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.08} />
    </line>
  );
};

const EarthGlobe = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshBasicMaterial color="#8ab4f8" transparent opacity={0.12} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Earth Body */}
      <mesh>
        <sphereGeometry args={[0.30, 32, 32]} />
        <meshStandardMaterial 
          color="#1d4ed8" // Royal Blue Ocean
          emissive="#14b8a6" // Soft green glowing continents
          emissiveIntensity={0.2}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>
      {/* Decorative Golden Equator Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.30, 0.32, 64]} />
        <meshBasicMaterial color="#c5a059" transparent opacity={0.25} />
      </mesh>
    </group>
  );
};

const CelestialSphereVisualization = ({ panchang, language }: { panchang: PanchangData, language: 'en' | 'hi' }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useEffect(() => {
    if (groupRef.current) {
      // Rotate so the Lagna is at the Eastern Horizon (3 o'clock position / angle 0)
      // The zodiac longitudes are measured from Aries (0°).
      // If Lagna is at L degrees, we rotate the sphere by -L degrees.
      const lagnaLong = (panchang as any).lagna.longitude || (panchang.lagna.index * 30);
      groupRef.current.rotation.z = -THREE.MathUtils.degToRad(lagnaLong);
    }
  }, [panchang.lagna.longitude, panchang.lagna.index]);

  const getPlanetPosition = (longitude: number, distance: number): [number, number, number] => {
    const angle = THREE.MathUtils.degToRad(longitude);
    const x = distance * Math.cos(angle);
    const y = distance * Math.sin(angle);
    return [x, y, 0];
  };

  const rashis = language === 'hi' ? RASHI_NAMES_HI : RASHI_NAMES_EN;

  return (
    <group>
      {/* 3D Semi-transparent Darkened Under-ground Dome representing the Night/Hidden sky */}
      <mesh position={[0, -2.5, -0.15]}>
        <planeGeometry args={[10, 5]} />
        <meshBasicMaterial 
          color="#47160f" // Deep warm rose-gold shadow
          transparent 
          opacity={0.25} 
        />
      </mesh>

      {/* Horizon Glass Divider Line */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[10, 0.03]} />
        <meshBasicMaterial color="#F27D26" transparent opacity={0.4} />
      </mesh>
      
      {/* Horizon Labels */}
      <Text position={[4.5, 0.2, 0.1]} fontSize={0.15} color="#F27D26" anchorX="right">{(translations[language] as any).east}</Text>
      <Text position={[-4.5, 0.2, 0.1]} fontSize={0.15} color="#F27D26" anchorX="left">{(translations[language] as any).west}</Text>
      <Text position={[0, 4.5, 0.1]} fontSize={0.15} color="#F27D26" anchorY="top">{(translations[language] as any).zenith}</Text>
      <Text position={[0, -4.5, 0.1]} fontSize={0.15} color="#F27D26" anchorY="bottom">{(translations[language] as any).nadir}</Text>

      {/* Orbit Rings (Behind planets) */}
      {Object.values(PLANET_DISTANCES).map((dist, index) => (
        <OrbitRing key={index} radius={dist} />
      ))}

      {/* Center Earth Globe */}
      <EarthGlobe />

      <group ref={groupRef}>
        {/* Rashi Circle Ring */}
        <OrbitRing radius={4} color="#C5A059" />

        {rashis.map((rashi, i) => {
          const angle = THREE.MathUtils.degToRad(i * 30 + 15); // Center of the sign
          const radius = 4;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          return (
            <group key={i} position={[x, y, 0]}>
              <Text
                fontSize={0.2}
                color="#FFD700"
                anchorX="center"
                anchorY="middle"
              >
                {rashi}
              </Text>
              <Text
                position={[0, -0.25, 0]}
                fontSize={0.15}
                color="#FFD700"
                fillOpacity={0.5}
                anchorX="center"
                anchorY="middle"
              >
                {RASHI_SYMBOLS[i]}
              </Text>
            </group>
          );
        })}

        {panchang.planets.map(planet => {
          const meta = PLANET_METADATA[planet.name] || { color: "#FFD700", size: 0.12, emissiveIntensity: 1.5, labelColor: "white" };
          const dist = PLANET_DISTANCES[planet.name] || 2.8;
          return (
            <Planet
              key={planet.name}
              name={language === 'hi' ? planet.nameHi : planet.name}
              position={getPlanetPosition(planet.longitude, dist)}
              color={meta.color}
              size={meta.size}
              emissiveIntensity={meta.emissiveIntensity}
              labelColor={meta.labelColor}
              isRahuKetu={meta.isRahuKetu}
            />
          );
        })}
      </group>
    </group>
  );
};

const VedicWatch = ({ sunrise, language, panchang }: VedicWatchProps) => {
  const [page, setPage] = useState(0); // 0 for clock, 1 for sphere
  const [ishtaKala, setIshtaKala] = useState({ ghati: 0, pala: 0, vikal: 0 });
  const t = translations[language];

  useEffect(() => {
    const calculateIshtaKala = () => {
      const now = new Date();
      const totalSecondsSinceSunrise = (now.getTime() - sunrise.getTime()) / 1000;

      if (totalSecondsSinceSunrise < 0) {
        setIshtaKala({ ghati: 0, pala: 0, vikal: 0 });
        return;
      }

      const ghati = Math.floor(totalSecondsSinceSunrise / 1440);
      const pala = Math.floor((totalSecondsSinceSunrise % 1440) / 24);
      const vikal = Math.floor((totalSecondsSinceSunrise % 24) / 0.4); // This will be fast, but let's stick to the formula

      setIshtaKala({ ghati, pala, vikal });
    };

    const intervalId = setInterval(calculateIshtaKala, 400); // Update every 0.4 seconds for vikal precision

    return () => clearInterval(intervalId);
  }, [sunrise]);

  const toDevanagari = (num: number) => {
    if (language === 'hi') {
      return num.toLocaleString('hi-IN', { useGrouping: false });
    }
    return num.toString().padStart(2, '0');
  };

  const ghatiRotation = (ishtaKala.ghati / 60) * 360 + (ishtaKala.pala / 60) * 6;
  const palaRotation = (ishtaKala.pala / 60) * 360 + (ishtaKala.vikal / 60) * 6;
  const vikalRotation = (ishtaKala.vikal / 60) * 360;

  return (
    <div className="w-full max-w-sm mx-auto font-tiro-devanagari px-4 pt-8 pb-4">
      <div className="relative overflow-hidden" style={{ height: '480px', maxHeight: '80vh' }}>
        <motion.div
          className="flex h-full"
          style={{ width: '200%' }}
          animate={{ x: page === 0 ? '0%' : '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Page 1: Ishta Kala Clock */}
          <div className="w-1/2 h-full flex flex-col items-center justify-center p-4">
            <h2 className="text-sm font-bold tracking-widest uppercase text-rose-gold-300/70 mb-4">
              {language === 'hi' ? 'इष्ट काल' : 'Ishta Kala'}
            </h2>
            <div className="w-full aspect-square max-w-[280px] mx-auto bg-cosmic-indigo border-4 border-rose-gold-700 rounded-full shadow-2xl relative flex items-center justify-center">
              <div className="absolute inset-0 bg-cosmic-indigo rounded-full" style={{ backgroundImage: 'url(/sri-yantra-bg.svg)' }}></div>
              
              {/* Day/Night Arc */}
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-rose-gold-500/20 border-r-rose-gold-500/20 opacity-30"></div>

              {/* Tick Marks */}
              <div className="absolute inset-0 z-10">
                {[...Array(60)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full h-full"
                    style={{ transform: `rotate(${i * 6}deg)` }}
                  >
                    <div
                      className={`absolute top-0 left-1/2 -translate-x-1/2 h-3 ${i % 5 === 0 ? 'w-1 bg-rose-gold-300' : 'w-0.5 bg-rose-gold-300/50'}`}
                    />
                    {i % 5 === 0 && (
                      <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] text-rose-gold-300/40 font-bold">
                        {toDevanagari(i)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Hands */}
              <div
                className="absolute bottom-1/2 left-1/2 w-1.5 h-1/4 bg-rose-gold-200 origin-bottom rounded-t-full z-20 shadow-lg"
                style={{ transform: `translateX(-50%) rotate(${ghatiRotation}deg)` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-rose-gold-200 font-bold">घ</div>
              </div>
              <div
                className="absolute bottom-1/2 left-1/2 w-1 h-1/3 bg-rose-gold-400 origin-bottom rounded-t-full z-20 shadow-md"
                style={{ transform: `translateX(-50%) rotate(${palaRotation}deg)` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-rose-gold-400 font-bold">प</div>
              </div>
              <div
                className="absolute bottom-1/2 left-1/2 w-0.5 h-2/5 bg-rose-gold-600 origin-bottom z-20"
                style={{ transform: `translateX(-50%) rotate(${vikalRotation}deg)` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-rose-gold-600 font-bold">वि</div>
              </div>

              {/* Center Pivot */}
              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-rose-gold-700 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-cosmic-indigo z-30 shadow-xl" />

              {/* Digital Display */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-rose-gold-500/20 z-40">
                <p className="text-[10px] font-bold text-rose-gold-300 font-hindi">
                  {toDevanagari(ishtaKala.ghati)} : {toDevanagari(ishtaKala.pala)} : {toDevanagari(ishtaKala.vikal)}
                </p>
              </div>
            </div>
            
            {/* Quick Info */}
            <div className="mt-4 grid grid-cols-2 gap-4 w-full">
              <div className="bg-rose-gold-500/5 p-2 rounded-xl border border-rose-gold-500/10 text-center">
                <p className="text-[8px] uppercase text-rose-gold-300/40 font-bold mb-1">{(t as any).tithi}</p>
                <p className="text-xs font-bold text-rose-gold-100 font-hindi truncate">{panchang.tithi.name}</p>
              </div>
              <div className="bg-rose-gold-500/5 p-2 rounded-xl border border-rose-gold-500/10 text-center">
                <p className="text-[8px] uppercase text-rose-gold-300/40 font-bold mb-1">{(t as any).nakshatra}</p>
                <p className="text-xs font-bold text-rose-gold-100 font-hindi truncate">{panchang.nakshatra.name}</p>
              </div>
            </div>
          </div>

          {/* Page 2: Rashi Chakra */}
          <div className="w-1/2 h-full flex flex-col items-center justify-center p-4">
            <h2 className="text-sm font-bold tracking-widest uppercase text-rose-gold-300/70 mb-4">
              {language === 'hi' ? 'राशि चक्र' : 'Rashi Chakra'}
            </h2>
            {panchang && (
              <>
                <div 
                  className="w-full flex-grow bg-cosmic-indigo rounded-2xl overflow-hidden"
                  onWheel={(e) => e.stopPropagation()}
                >
                  <Canvas camera={{ position: [0, 0, 7], fov: 75 }} onCreated={({ gl }) => gl.setClearColor('#0a0502')}>
                    <OrbitControls enableZoom={true} />
                    <ambientLight intensity={0.2} />
                    <pointLight position={[10, 10, 10]} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
                    <CelestialSphereVisualization panchang={panchang} language={language} />
                  </Canvas>
                </div>
                <div className="text-center mt-2 flex-shrink-0">
                  <p className="text-xs uppercase text-rose-gold-300/50 tracking-widest">{language === 'hi' ? 'वर्तमान लग्न' : 'Current Lagna'}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl text-cyan-300" style={{ textShadow: '0 0 8px #00FFFF' }}>
                      {RASHI_SYMBOLS[panchang.lagna.index]}
                    </span>
                    <span className="text-lg font-bold text-white">
                      {language === 'hi' ? RASHI_NAMES_HI[panchang.lagna.index] : RASHI_NAMES_EN[panchang.lagna.index]}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Page Navigation Buttons */}
      <div className="mt-4 flex justify-center">
        <div className="flex p-1 bg-cosmic-indigo/50 rounded-full border border-rose-gold-500/20">
          <button 
            onClick={() => setPage(0)}
            className={`px-4 py-2 text-xs rounded-full ${page === 0 ? 'bg-rose-gold-300 text-cosmic-indigo' : 'text-white'}`}>
            {language === 'hi' ? 'इष्ट काल' : 'Ishta Kala'}
          </button>
          <button 
            onClick={() => setPage(1)}
            className={`px-4 py-2 text-xs rounded-full ${page === 1 ? 'bg-rose-gold-300 text-cosmic-indigo' : 'text-white'}`}>
            {language === 'hi' ? 'राशि चक्र' : 'Rashi Chakra'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VedicWatch;
