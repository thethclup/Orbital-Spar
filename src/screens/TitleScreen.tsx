import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '../store/gameStore';
import { Button } from '../components/ui/Button';
import { withAttribution } from '../lib/erc8021/attribution';

export const TitleScreen: React.FC = () => {
  const { setScreen, setScore } = useGameStore();
  const [gmStatus, setGmStatus] = useState<string>('');

  const handleSayGM = async () => {
    setGmStatus('Pending tx...');
    try {
      // Simulate Wagmi/Viem sendTransaction on Base Mainnet
      const dataPayload = withAttribution('0x474d'); // "GM"
      console.log('Sending transaction with payload:', dataPayload);
      
      // Fake delay
      await new Promise(r => setTimeout(r, 2000));
      setGmStatus('GM recorded on Base!');
      setTimeout(() => setGmStatus(''), 3000);
    } catch (e) {
      setGmStatus('Failed');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-transparent"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
        className="z-10 text-center mb-12 lg:hidden"
      >
        <h1 className="text-[70px] font-serif italic leading-[0.85] tracking-tight mb-4">
          Orbital<br/>
          <span className="text-[#ff00ff]">Spark</span>
        </h1>
        <p className="text-sm text-white/60 max-w-sm mx-auto font-light leading-relaxed">
          Guide sparks through planetary orbits to create massive energy chains.
        </p>
      </motion.div>

      {/* THE CORE VISUAL OVERLAY FOR FORGE  (Always visible on Title) */}
      <div className="relative z-10 text-center mb-12">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#ff00ff] to-[#00f5ff] blur-xl opacity-20 absolute -top-4 -left-4"></div>
        <div className="w-24 h-24 rounded-full border border-white/40 flex items-center justify-center relative bg-black/40 backdrop-blur-md mx-auto">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Forge</span>
        </div>
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="z-10 flex flex-col gap-4 w-full max-w-xs relative items-center"
      >
        <button 
          onClick={() => { setScore(0); setScreen('PLAYING'); }}
          className="px-10 py-4 w-full bg-white text-black font-bold text-xs uppercase tracking-[0.4em] transform hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] rounded-none"
        >
          Initialize Run
        </button>
        <button 
          onClick={() => setScreen('LEADERBOARD')}
          className="px-10 py-4 w-full bg-transparent border border-white/20 text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors"
        >
          Leaderboard
        </button>
        
        <div className="mt-4 pt-4 flex flex-col items-center gap-3 w-full">
          {gmStatus && <span className="text-xs text-[#00f5ff] font-mono">{gmStatus}</span>}
        </div>
      </motion.div>
    </motion.div>
  );
};
