import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '../store/gameStore';
import {
  useAccount,
  useConnect,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { base } from 'wagmi/chains';
import { parseEther, stringToHex } from 'viem';
import { withAttribution } from '../lib/erc8021/attribution';
import { BASE_EXPLORER_URL, GM_RECEIVER_ADDRESS } from '../lib/baseDenim';

export const GameOverScreen: React.FC = () => {
  const { score, resetGame, setScreen, longestChain, setLongestChain } = useGameStore();
  const [recordStatus, setRecordStatus] = useState<string>('');
  const { isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const {
    data: txHash,
    sendTransactionAsync,
    isPending: isSending,
  } = useSendTransaction();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: base.id,
  });

  useEffect(() => {
    if (score > longestChain) {
      setLongestChain(score);
    }
  }, [score, longestChain, setLongestChain]);

  useEffect(() => {
    if (isConfirming) {
      setRecordStatus('Confirming in 200ms block...');
    } else if (isConfirmed && receipt) {
      setRecordStatus(`Recorded in Base block #${receipt.blockNumber.toString()}`);
    }
  }, [isConfirming, isConfirmed, receipt]);

  const handleRecordScore = async () => {
    if (!isConnected) {
      const injectedConnector = connectors.find((c) => c.id === 'injected') ?? connectors[0];
      if (injectedConnector) {
        setRecordStatus('Connecting wallet...');
        connect({ connector: injectedConnector, chainId: base.id });
      } else {
        setRecordStatus('No Web3 wallet detected');
      }
      return;
    }

    try {
      if (chainId !== base.id) {
        setRecordStatus('Switching to Base Mainnet...');
        await switchChainAsync({ chainId: base.id });
      }

      setRecordStatus('Confirm transaction in wallet...');
      const payload = withAttribution(stringToHex(`ORBITAL_SPARK:SCORE:${score}`));
      await sendTransactionAsync({
        chainId: base.id,
        to: GM_RECEIVER_ADDRESS,
        value: parseEther('0'),
        data: payload,
      });
    } catch {
      setRecordStatus('Transaction rejected');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#050508]/90 backdrop-blur-sm z-50"
    >
      <div className="max-w-md w-full border border-white/10 bg-[#050508] p-10 text-center relative overflow-hidden">
        
        {/* Decor */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#ff00ff]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#00f5ff]/10 rounded-full blur-3xl" />

        <h2 className="text-5xl font-serif italic mb-2 relative z-10 text-white">Collapsed</h2>
        <p className="text-xs font-light text-white/50 mb-10 relative z-10 uppercase tracking-[0.2em]">The orbital resonance destabilized.</p>

        <div className="mb-10 relative z-10">
          <p className="text-[10px] text-[#00f5ff] uppercase tracking-[0.3em] mb-2 font-bold">Final Energy</p>
          <p className="text-6xl font-serif text-white mb-2">{score.toLocaleString()}</p>
        </div>

        <div className="flex flex-col gap-4 relative z-10 items-center">
          <button 
            onClick={handleRecordScore}
            disabled={isSending || isConfirming}
            className="px-10 py-4 w-full bg-white text-black font-bold text-xs uppercase tracking-[0.4em] transform hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50"
          >
            {isSending
              ? 'Signing...'
              : isConfirming
                ? 'Confirming...'
                : isConnected
                  ? 'Record Orbit On-Chain'
                  : 'Connect & Record On Base'}
          </button>
          {recordStatus && (
            <p className="text-[10px] text-[#00f5ff] font-mono mt-1 uppercase">
              {recordStatus}
            </p>
          )}
          {txHash && isConfirmed && (
            <a
              href={`${BASE_EXPLORER_URL}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.2em] text-white/60 underline hover:text-white"
            >
              View on BaseScan
            </a>
          )}
          
          <button 
            onClick={() => resetGame()} 
            className="px-10 py-4 w-full bg-transparent border border-white/20 text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors mt-2"
          >
            Weave Again
          </button>
          <button 
            onClick={() => setScreen('TITLE')} 
            className="text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white mt-4"
          >
            Return to Title
          </button>
        </div>
      </div>
    </motion.div>
  );
};
