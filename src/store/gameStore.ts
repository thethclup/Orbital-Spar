import { create } from 'zustand';

export type ScreenState = 'TITLE' | 'PLAYING' | 'GAMEOVER' | 'LEADERBOARD' | 'CODEX';

interface GameState {
  screen: ScreenState;
  score: number;
  longestChain: number;
  sparks: number;
  setScreen: (screen: ScreenState) => void;
  setScore: (score: number) => void;
  setLongestChain: (chain: number) => void;
  addSparks: (amount: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'TITLE',
  score: 0,
  longestChain: 0,
  sparks: 0,
  setScreen: (screen) => set({ screen }),
  setScore: (score) => set({ score }),
  setLongestChain: (longestChain) => set({ longestChain }),
  addSparks: (amount) => set((state) => ({ sparks: state.sparks + amount })),
  resetGame: () => set({ score: 0, longestChain: 0, screen: 'PLAYING' }),
}));
