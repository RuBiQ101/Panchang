import React from 'react';

interface KundaliProps {
  birthDetails: {
    date: string;
    time: string;
    lat: number;
    lon: number;
  };
}

// North Indian Style Chart
// A square divided into 12 houses
export const NorthIndianChart: React.FC<KundaliProps> = ({ birthDetails }) => {
  // In a real app, we'd calculate planetary positions here.
  // For this demo, we'll render the traditional diamond-grid structure.
  
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto border-2 border-ink bg-white p-4">
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-ink stroke-[0.5] fill-none">
        {/* Outer Square */}
        <rect x="0" y="0" width="100" height="100" />
        
        {/* Diagonals */}
        <line x1="0" y1="0" x2="100" y2="100" />
        <line x1="100" y1="0" x2="0" y2="100" />
        
        {/* Inner Diamond */}
        <path d="M50 0 L100 50 L50 100 L0 50 Z" />
        
        {/* House Labels (1-12) */}
        <text x="50" y="45" className="fill-ink/40 text-[5px] font-hindi text-center" textAnchor="middle">1</text>
        <text x="25" y="20" className="fill-ink/40 text-[5px] font-hindi text-center" textAnchor="middle">2</text>
        <text x="20" y="26" className="fill-ink/40 text-[5px] font-hindi text-center" textAnchor="middle">3</text>
        <text x="40" y="52" className="fill-ink/40 text-[5px] font-hindi text-center" textAnchor="middle">4</text>
        <text x="20" y="76" className="fill-ink/40 text-[5px] font-hindi text-center" textAnchor="middle">5</text>
        <text x="25" y="82" className="fill-ink/40 text-[5px] font-hindi text-center" textAnchor="middle">6</text>
        <text x="50" y="58" className="fill-ink/40 text-[5px] font-hindi text-center" textAnchor="middle">7</text>
        <text x="75" y="82" className="fill-ink/40 text-[5px] font-hindi text-center" textAnchor="middle">8</text>
        <text x="80" y="76" className="fill-ink/40 text-[5px] font-hindi text-center" textAnchor="middle">9</text>
        <text x="60" y="52" className="fill-ink/40 text-[5px] font-hindi text-center" textAnchor="middle">10</text>
        <text x="80" y="26" className="fill-ink/40 text-[5px] font-hindi text-center" textAnchor="middle">11</text>
        <text x="75" y="20" className="fill-ink/40 text-[5px] font-hindi text-center" textAnchor="middle">12</text>

        {/* Mock Planets */}
        <text x="50" y="20" className="fill-saffron font-bold text-[5px]" textAnchor="middle">Su, Me</text>
        <text x="25" y="10" className="fill-gold font-bold text-[5px]" textAnchor="middle">Ve</text>
        <text x="10" y="26" className="fill-ink font-bold text-[5px]" textAnchor="middle">Ma</text>
        <text x="20" y="52" className="fill-ink font-bold text-[5px]" textAnchor="middle">Ju</text>
        <text x="10" y="76" className="fill-ink font-bold text-[5px]" textAnchor="middle">Ra</text>
        <text x="25" y="92" className="fill-ink font-bold text-[5px]" textAnchor="middle"></text>
        <text x="50" y="82" className="fill-ink font-bold text-[5px]" textAnchor="middle">Mo</text>
        <text x="75" y="92" className="fill-ink font-bold text-[5px]" textAnchor="middle"></text>
        <text x="90" y="76" className="fill-ink font-bold text-[5px]" textAnchor="middle">Ke</text>
        <text x="80" y="52" className="fill-ink font-bold text-[5px]" textAnchor="middle">Sa</text>
        <text x="90" y="26" className="fill-ink font-bold text-[5px]" textAnchor="middle"></text>
        <text x="75" y="10" className="fill-ink font-bold text-[5px]" textAnchor="middle"></text>
      </svg>
      <div className="mt-4 text-center">
        <p className="text-xs font-serif italic text-ink/60">North Indian Style Chart (D1)</p>
      </div>
    </div>
  );
};
