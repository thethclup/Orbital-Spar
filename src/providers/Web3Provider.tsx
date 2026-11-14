import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { createConfig, fallback, http, WagmiProvider, webSocket } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import {
  BASE_MAINNET_RPC_URL,
  BASE_MAINNET_WS_URL,
  DENIM_BLOCK_TIME_MS,
} from '../lib/baseDenim';

const baseTransport = BASE_MAINNET_WS_URL
  ? fallback([
      webSocket(BASE_MAINNET_WS_URL),
      http(BASE_MAINNET_RPC_URL),
    ])
  : http(BASE_MAINNET_RPC_URL);

const config = createConfig({
  chains: [base],
  connectors: [injected()],
  pollingInterval: DENIM_BLOCK_TIME_MS,
  transports: {
    [base.id]: baseTransport,
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
