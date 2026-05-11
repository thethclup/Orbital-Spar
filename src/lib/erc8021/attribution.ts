import { encodePacked, toHex, stringToHex } from 'viem';

/**
 * ERC-8021: Transaction Attribution & Builder Codes
 * Appends builder and attribution codes to transaction calldata.
 */

const APP_ATTRIBUTION_CODE = 'ORBITAL_SPARK';
const BUILDER_CODE = 'bc_pke2iy5l';

export function withAttribution(originalData: `0x${string}` = '0x'): `0x${string}` {
  // Simple payload attribution implementation (for demonstration)
  // Real implementation would properly encode per ERC-8021 specs.
  const attributionHex = stringToHex(`|ATT:${APP_ATTRIBUTION_CODE}|BUILDER:${BUILDER_CODE}`);
  return `${originalData}${attributionHex.replace('0x', '')}` as `0x${string}`;
}
