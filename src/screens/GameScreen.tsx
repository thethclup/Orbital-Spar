import React from 'react';
import { useGameStore } from '../store/gameStore';
import { CosmicForge } from '../components/canvas/CosmicForge';
import { motion } from 'motion/react';

export const GameScreen: React.FC = () => {
  const { score } = useGameStore();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0"
    >
      <CosmicForge />
      
      {/* HUD layer - Hidden on large screens where sidebar shows score */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none lg:hidden">
        <div className="bg-[#050508]/80 backdrop-blur-md px-6 py-3 border border-white/10">
          <p className="text-[10px] text-[#ffd700] uppercase tracking-[0.2em] mb-1">Current Energy</p>
          <p className="text-4xl font-serif text-white">{score.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
};
