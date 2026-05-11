import React from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '../store/gameStore';

const LEADERBOARD_DATA = [
  { rank: 1, address: '0x1234...5678', score: 145000, type: 'onchain' },
  { rank: 2, address: '0xabcd...ef01', score: 122500, type: 'onchain' },
  { rank: 3, address: 'Guest_981', score: 95000, type: 'offchain' },
  { rank: 4, address: '0x9999...1111', score: 87000, type: 'onchain' },
  { rank: 5, address: '0x7777...2222', score: 45000, type: 'onchain' },
];

export const LeaderboardScreen: React.FC = () => {
  const { setScreen } = useGameStore();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="absolute inset-0 bg-[#050508]/95 p-6 flex flex-col z-50 backdrop-blur-md"
    >
      <div className="max-w-2xl w-full mx-auto flex flex-col h-full pt-12 pb-6">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-4xl lg:text-5xl font-serif italic text-white mb-2 tracking-tight">Greatest Weavers</h2>
            <p className="text-[10px] text-white/50 tracking-[0.2em] uppercase">Base Mainnet Hybrid Leaderboard</p>
          </div>
          <button 
            onClick={() => setScreen('TITLE')}
            className="text-[10px] uppercase tracking-[0.2em] px-4 py-2 border border-white/20 hover:bg-white/10 transition-colors"
          >
            Back to Title
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-12 gap-4 py-4 border-b border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-6">Weaver (Address)</div>
            <div className="col-span-4 text-right">Max Energy</div>
          </div>
          
          <div className="overflow-y-auto flex-1 mt-2">
            {LEADERBOARD_DATA.map((entry) => (
              <div 
                key={entry.rank}
                className="grid grid-cols-12 gap-4 py-5 items-center border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <div className="col-span-2 text-center font-serif text-2xl text-white/50 italic">
                  #{entry.rank}
                </div>
                <div className="col-span-6 flex items-center gap-3">
                  <span className="font-mono text-sm text-white">{entry.address}</span>
                  {entry.type === 'onchain' && (
                    <span className="text-[8px] uppercase tracking-[0.2em] text-[#00f5ff] border border-[#00f5ff]/30 px-2 py-0.5">Verified</span>
                  )}
                </div>
                <div className="col-span-4 text-right font-serif text-xl tracking-wider text-white">
                  {entry.score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
