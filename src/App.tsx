import React, { useEffect, useState } from 'react';
import { Web3Provider } from './providers/Web3Provider';
import { useGameStore } from './store/gameStore';
import { TitleScreen } from './screens/TitleScreen';
import { GameScreen } from './screens/GameScreen';
import { GameOverScreen } from './screens/GameOverScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { AnimatePresence } from 'motion/react';
import {
  useAccount,
  useBlockNumber,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { base } from 'wagmi/chains';
import { parseEther } from 'viem';
import { Sun } from 'lucide-react';
import {
  BASE_BUILDER_DATA_SUFFIX,
  GM_RECEIVER_ADDRESS,
} from './lib/baseDenim';

function GameRouter() {
  const { screen } = useGameStore();

  return (
    <AnimatePresence mode="wait">
      {screen === 'TITLE' && <TitleScreen key="title" />}
      {screen === 'PLAYING' && <GameScreen key="playing" />}
      {screen === 'GAMEOVER' && (
        <React.Fragment key="gameover-wrapper">
          <GameScreen key="playing-bg" />
          <GameOverScreen key="gameover" />
        </React.Fragment>
      )}
      {screen === 'LEADERBOARD' && <LeaderboardScreen key="leaderboard" />}
    </AnimatePresence>
  );
}

function MainLayout({ score }: { score: number }) {
  const { isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const {
    data: gmTxHash,
    sendTransactionAsync,
    isPending: isSendingGm,
  } = useSendTransaction();
  const { isLoading: isConfirmingGm, isSuccess: isGmConfirmed } =
    useWaitForTransactionReceipt({
      hash: gmTxHash,
      chainId: base.id,
    });
  const { data: canonicalBlock } = useBlockNumber({
    chainId: base.id,
    watch: true,
  });
  const [gmNotice, setGmNotice] = useState<string>('');

  const isWrongChain = isConnected && chainId !== base.id;

  useEffect(() => {
    if (isGmConfirmed) {
      setGmNotice('GM confirmed on Base');
      const timer = setTimeout(() => setGmNotice(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [isGmConfirmed]);

  const handleConnect = () => {
    const injectedConnector = connectors.find((c) => c.id === 'injected') ?? connectors[0];
    if (injectedConnector) {
      connect({ connector: injectedConnector, chainId: base.id });
    }
  };

  const handleSwitchToBase = async () => {
    try {
      await switchChainAsync({ chainId: base.id });
    } catch {
      setGmNotice('Switch to Base rejected');
      setTimeout(() => setGmNotice(''), 3000);
    }
  };

  const sendGMTransaction = async () => {
    if (!isConnected) {
      handleConnect();
      return;
    }

    try {
      setGmNotice('');
      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id });
      }
      await sendTransactionAsync({
        chainId: base.id,
        to: GM_RECEIVER_ADDRESS,
        value: parseEther('0'),
        data: BASE_BUILDER_DATA_SUFFIX,
      });
    } catch {
      setGmNotice('Transaction cancelled');
      setTimeout(() => setGmNotice(''), 3000);
    }
  };

  return (
      <div className="w-full h-screen bg-[#050508] text-[#F0F0F0] font-sans flex flex-col overflow-hidden selection:bg-[#00f5ff] selection:text-black">
        {/* TOP NAVIGATION BAR */}
        <nav className="flex justify-between items-center py-4 px-6 md:py-6 md:px-10 border-b border-white/10 shrink-0 relative z-20 bg-[#050508]">
          <div className="flex items-center gap-4 md:gap-8">
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#00f5ff] hidden sm:block">System // 1.0.4</span>
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-60">
              Base Mainnet // 200ms{canonicalBlock ? ` #${canonicalBlock.toString()}` : ''}
            </span>
          </div>
          <div className="flex gap-4 md:gap-6 items-center">
            {gmNotice && (
              <span className="hidden md:inline text-[10px] uppercase tracking-[0.2em] text-[#00f5ff] font-mono">
                {gmNotice}
              </span>
            )}
            {isConnected ? (
              <>
                {isWrongChain ? (
                  <button
                    onClick={handleSwitchToBase}
                    disabled={isSwitching}
                    className="px-3 py-2 rounded-lg bg-[#ff00ff]/20 hover:bg-[#ff00ff]/30 border border-[#ff00ff]/40 text-[#ff00ff] transition-colors text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                  >
                    {isSwitching ? 'Switching...' : 'Switch to Base'}
                  </button>
                ) : (
                  <button
                    onClick={sendGMTransaction}
                    disabled={isSendingGm || isConfirmingGm}
                    className="px-3 py-2 rounded-lg bg-[#E8A020]/20 hover:bg-[#E8A020]/30 border border-[#E8A020]/40 text-[#E8A020] transition-colors flex items-center gap-2 font-['Cinzel'] text-xs font-bold disabled:opacity-50"
                  >
                    <Sun size={14} />
                    {isSendingGm ? 'Signing...' : isConfirmingGm ? 'Confirming...' : 'Say GM'}
                  </button>
                )}
                <button onClick={() => disconnect()} className="hidden sm:block text-[11px] uppercase tracking-[0.2em] px-4 py-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors">Disconnect</button>
              </>
            ) : (
              <>
                <button
                  onClick={handleConnect}
                  className="hidden sm:block text-[11px] uppercase tracking-[0.2em] px-4 py-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors"
                >
                  Connect Wallet
                </button>
                <button
                  onClick={sendGMTransaction}
                  className="bg-[#00f5ff] text-black text-[11px] font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
                >
                  Say GM
                </button>
              </>
            )}
          </div>
        </nav>

        {/* MAIN VIEWPORT */}
        <main className="flex-1 flex overflow-hidden">
          
          {/* LEFT COLUMN: TITULAR ASYMMETRY (Hidden on Mobile) */}
          <section className="hidden lg:flex w-[35%] xl:w-[40%] border-r border-white/10 p-10 flex-col justify-between relative z-20 bg-[#050508]/40 pointer-events-none">
            <div className="pointer-events-auto">
              <h1 className="text-[70px] xl:text-[90px] font-serif italic leading-[0.85] tracking-tight mb-4">
                Orbital<br/>
                <span className="text-[#ff00ff]">Spark</span>
              </h1>
              <p className="text-sm text-white/60 max-w-xs font-light leading-relaxed">
                Guide sparks through planetary orbits to create massive energy chains. Connect celestial bodies to unlock the secrets of the Cosmic Forge.
              </p>
            </div>

            <div className="space-y-8 pointer-events-auto">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#ffd700]">Current Energy</span>
                <span className="text-6xl font-light font-serif">{score.toLocaleString()}<span className="text-xl align-top opacity-50 italic underline ml-1">res</span></span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-[#00f5ff] flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#00f5ff] rounded-full animate-pulse"></div>
                </div>
                <span className="text-[11px] uppercase tracking-widest">Chain Status: <span className="text-[#00f5ff]">Plasma High</span></span>
              </div>
            </div>
          </section>

          {/* CENTER: THE COSMIC FORGE */}
          <section className="flex-1 relative bg-[radial-gradient(circle_at_center,_#1a1033_0%,_#050508_70%)] flex items-center justify-center overflow-hidden">
            {/* The Game Router overlays exactly into this central column */}
            <GameRouter />
            
            {/* FLOATING METADATA - Desktop Only */}
            <div className="absolute top-10 right-10 text-right space-y-2 hidden md:block pointer-events-none z-10">
              <div className="text-[10px] uppercase opacity-40">Gravitational Pull</div>
              <div className="text-xl font-serif tracking-widest">0.88 G</div>
            </div>
            <div className="absolute bottom-10 left-10 space-y-2 hidden md:block pointer-events-none z-10">
              <div className="text-[10px] uppercase opacity-40">Nearest Celestial Body</div>
              <div className="text-xl font-serif tracking-widest text-[#ffd700]">Europa // Moon</div>
            </div>
          </section>

          {/* RIGHT COLUMN: LEADERBOARD & METRICS (Hidden on Mobile/Tablet) */}
          <section className="hidden xl:flex w-[250px] border-l border-white/10 bg-[#08080c] p-8 flex-col relative z-20 pointer-events-none">
            <div className="mb-10 pointer-events-auto">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-white/50">Top Weavers</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-[11px] font-mono opacity-80 italic">0x4f...a29</span>
                  <span className="text-sm font-bold">1.2M</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-[11px] font-mono opacity-80 italic">0x8e...f11</span>
                  <span className="text-sm font-bold">984K</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-[11px] font-mono opacity-80 italic">0x12...c44</span>
                  <span className="text-sm font-bold">856K</span>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-4 bg-white/5 p-4 rounded-lg pointer-events-auto">
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#ff00ff]">Daily Alignment</div>
              <p className="text-[11px] leading-relaxed text-white/70 italic">
                "The moons of Jupiter are aligning. Spark efficiency increased by 15% for the next 4 hours."
              </p>
            </div>
          </section>
        </main>

        {/* FOOTER STATUS BAR */}
        <footer className="h-12 border-t border-white/10 px-6 md:px-10 flex items-center justify-between bg-black text-[10px] uppercase tracking-[0.2em] font-medium shrink-0 relative z-20">
          <div className="flex gap-4 md:gap-8">
            <span className="hidden sm:inline">Session Score: <span className="text-white">{score.toLocaleString()}</span></span>
            <span>Active Sparks: <span className="text-[#00f5ff]">0</span></span>
          </div>
          <div className="flex gap-4 md:gap-8">
            <span className="hidden sm:inline">Builder: <span className="text-white">bc_pke2iy5l</span></span>
            <span className="text-[#ffd700]">Quantum Stable</span>
          </div>
        </footer>
      </div>
  );
}

export default function App() {
  const { score } = useGameStore();

  return (
    <Web3Provider>
      <MainLayout score={score} />
    </Web3Provider>
  );
}

