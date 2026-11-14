import { base } from 'wagmi/chains';

/**
 * Base Mainnet (Denim Upgrade) Configuration
 *
 * Denim activated on Base Mainnet on Nov 5, 2026, retiring Flashblocks in favor
 * of 200ms canonical blocks. All RPC calls and subscriptions target canonical
 * state ("latest" / eth_subscribe("newHeads")) rather than "pending" or retired
 * Flashblocks WebSocket streams.
 */
export const BASE_MAINNET_CHAIN = base;
export const DENIM_BLOCK_TIME_MS = 200;

export const BASE_MAINNET_RPC_URL =
  import.meta.env.VITE_BASE_RPC_URL || 'https://mainnet.base.org';

export const BASE_MAINNET_WS_URL =
  import.meta.env.VITE_BASE_WS_URL || '';

export const BASE_EXPLORER_URL = 'https://basescan.org';

export const GM_RECEIVER_ADDRESS =
  '0xc35B9997B63B1CE14f8F513f7eddD9a7ABbB33d7' as const;

// ERC-8021 Default Base Builder App suffix
export const BASE_BUILDER_DATA_SUFFIX =
  '0x07626173656170700080218021802180218021802180218021' as const;
