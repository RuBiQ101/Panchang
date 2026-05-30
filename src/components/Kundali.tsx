import React from 'react';

interface KundaliProps {
  birthDetails: {
    date: string;
    time: string;
    lat: number;
    lon: number;
  };
  planets: { name: string; nameHi: string; house: number }[];
  language: 'en' | 'hi';
}

export const NorthIndianChart: React.FC<KundaliProps> = ({ planets, language }) => {
  // House positions in SVG (approximate centers for text)
  const housePositions = [
    { x: 50, y: 35 }, // House 1
    { x: 25, y: 15 }, // House 2
    { x: 15, y: 25 }, // House 3
    { x: 35, y: 50 }, // House 4
    { x: 15, y: 75 }, // House 5
    { x: 25, y: 85 }, // House 6
    { x: 50, y: 65 }, // House 7
    { x: 75, y: 85 }, // House 8
    { x: 85, y: 75 }, // House 9
    { x: 65, y: 50 }, // House 10
    { x: 85, y: 25 }, // House 11
    { x: 75, y: 15 }, // House 12
  ];

  const getPlanetsInHouse = (houseNum: number) => {
    return planets
      .filter(p => p.house === houseNum)
      .map(p => language === 'hi' ? p.nameHi : p.name.substring(0, 2))
      .join(', ');
  };

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto border-[3px] border-saffron-dark bg-amber-50 p-4 shadow-xl rounded-sm">
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-saffron-dark stroke-[0.8] fill-none">
        {/* Outer Square */}
        <rect x="0" y="0" width="100" height="100" className="fill-white" />
        
        {/* Diagonals */}
        <line x1="0" y1="0" x2="100" y2="100" />
        <line x1="100" y1="0" x2="0" y2="100" />
        
        {/* Inner Diamond */}
        <path d="M50 0 L100 50 L50 100 L0 50 Z" className="fill-saffron/5" />
        
        {/* House Labels & Planets */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
          <g key={h}>
            {/* House Number */}
            <text 
              x={housePositions[h-1].x} 
              y={housePositions[h-1].y + 10} 
              className="fill-saffron-dark/30 text-[4px] font-bold" 
              textAnchor="middle"
            >
              {h}
            </text>
            {/* Planets */}
            <text 
              x={housePositions[h-1].x} 
              y={housePositions[h-1].y} 
              className="fill-ink font-bold text-[5px] font-hindi" 
              textAnchor="middle"
            >
              {getPlanetsInHouse(h)}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-4 text-center">
        <p className="text-xs font-serif italic text-ink/60">
          {language === 'hi' ? 'उत्तर भारतीय शैली (D1)' : 'North Indian Style Chart (D1)'}
        </p>
      </div>
    </div>
  );
};
