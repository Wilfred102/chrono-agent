import { Facilitator, CronosNetwork } from '@crypto.com/facilitator-client';
import { ethers } from 'ethers';

export type PaymentRequirements = {
  scheme: 'exact';
  network: 'cronos' | 'cronos-testnet' | string;
  payTo: string;
  asset: string;
  maxAmountRequired: string; // smallest unit string
  maxTimeoutSeconds: number;
};

export type PaymentRequiredResponse = {
  error: 'Payment Required';
  x402Version: number;
  paymentRequirements: PaymentRequirements;
};

export type PremiumResponse = {
  content: unknown;
  settlement?: {
    txHash: string;
    blockNumber: number;
    timestamp: string | number;
    amount: string;
    from: string;
    to: string;
    asset: string;
  };
};

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function getRequirements(): Promise<PaymentRequirements> {
  const res = await fetch(`${BACKEND_BASE}/api/x402/requirements`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load requirements: ${res.status}`);
  const json = await res.json();
  return json.paymentRequirements as PaymentRequirements;
}

export async function getPremiumData(xPaymentBase64?: string): Promise<PremiumResponse | PaymentRequiredResponse> {
  const headers: HeadersInit = {};
  if (xPaymentBase64) headers['X-PAYMENT'] = xPaymentBase64;

  const res = await fetch(`${BACKEND_BASE}/api/premium-data`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (res.status === 402) {
    return (await res.json()) as PaymentRequiredResponse;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Premium fetch failed: ${res.status} ${text}`);
  }
  return (await res.json()) as PremiumResponse;
}

// Helper to run the 402 dance. If payment is needed, returns info to let caller provide a Base64 X-PAYMENT header and retry.
export async function fetchWithX402() {
  const first = await getPremiumData();
  if ((first as PaymentRequiredResponse).paymentRequirements) {
    const pr = first as PaymentRequiredResponse;
    return {
      status: 402 as const,
      requirements: pr.paymentRequirements,
      retry: async (xPaymentBase64: string) => getPremiumData(xPaymentBase64),
    };
  }
  return { status: 200 as const, data: first as PremiumResponse };
}

function toCronosNetwork(network: string): CronosNetwork {
  if (network === 'cronos' || /mainnet/i.test(network)) return CronosNetwork.CronosMainnet as any;
  return CronosNetwork.CronosTestnet as any;
}

// Create a Facilitator client based on backend-provided network.
export function createFacilitatorFor(network: string) {
  return new Facilitator({ network: toCronosNetwork(network) });
}

// Get an ethers signer from the user's injected provider (e.g., wallet via wagmi/RainbowKit).
export async function getEthersSigner(): Promise<ethers.Signer> {
  if (typeof window === 'undefined' || !(window as any).ethereum) throw new Error('No wallet provider found');
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  return provider.getSigner();
}

// Generate a Base64 X-PAYMENT header using the official SDK and the connected wallet.
export async function generatePaymentHeader(requirements: PaymentRequirements, value?: string) {
  const facilitator = createFacilitatorFor(requirements.network);
  const signer = await getEthersSigner();
  const header = await facilitator.generatePaymentHeader({
    to: requirements.payTo,
    value: value ?? requirements.maxAmountRequired,
    signer,
    validBefore: Math.floor(Date.now() / 1000) + Math.min(5400, requirements.maxTimeoutSeconds || 300),
  });
  return header; // Base64 string
}

// ----- Invoice micropayments via x402 -----
export async function getInvoicePayRequirements(id: string | number) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const res = await fetch(`${base}/api/invoices/${id}/pay`, { method: 'GET', cache: 'no-store' });
  if (res.status === 402) {
    const json = await res.json();
    return { status: 402 as const, requirements: json.paymentRequirements, invoice: json.invoice };
  }
  if (!res.ok) throw new Error(`Invoice requirements failed: ${res.status}`);
  return { status: 200 as const, data: await res.json() };
}

export async function postInvoicePaymentHeader(id: string | number, paymentHeader: string) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const res = await fetch(`${base}/api/invoices/${id}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentHeader }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Invoice payment failed: ${res.status} ${text}`);
  }
  return res.json();
}