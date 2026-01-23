"use client";

import React from "react";
import { useState } from "react";
// import { fetchWithX402, PaymentRequirements, PremiumResponse } from "@/src/lib/x402";
import { fetchWithX402, PaymentRequirements, PremiumResponse } from "@/lib/x402";
import { useChainId, useSwitchChain } from "wagmi";
import { cronos, cronosTestnet } from "wagmi/chains";

function NetworkBadge({ network }: { network: string }) {
  return (
    <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
      {network}
    </span>
  );
}

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<PaymentRequirements | null>(null);
  const [xPayment, setXPayment] = useState("");
  const [result, setResult] = useState<PremiumResponse | null>(null);

  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  async function handleUnlock() {
    setLoading(true);
    setError(null);
    setResult(null);
    setRequirements(null);
    try {
      const r = await fetchWithX402();
      if (r.status === 200) {
        setResult(r.data);
      } else {
        setRequirements(r.requirements);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry() {
    if (!xPayment) {
      setError("Provide an X-PAYMENT header value");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bridge-x402`, { method: "POST" });
      // No-op: placeholder in case we later need a local bridge. For now, call backend directly via helper.
    } catch {}
    try {
      const r = await fetch(`/api/noop`);
      // ignore
    } catch {}
    try {
      const r = await fetchWithX402();
      if (r.status === 200) {
        setResult(r.data);
        return;
      }
      const paid = await r.retry(xPayment);
      if ((paid as any)?.content) {
        setResult(paid as PremiumResponse);
      } else {
        setError("Payment retry did not return content");
      }
    } catch (e: any) {
      setError(e?.message || "Retry failed");
    } finally {
      setLoading(false);
    }
  }

  async function ensureNetwork() {
    if (!requirements) return;
    try {
      if (requirements.network === "cronos" && chainId !== cronos.id) {
        await switchChainAsync({ chainId: cronos.id });
      }
      if (requirements.network === "cronos-testnet" && chainId !== cronosTestnet.id) {
        await switchChainAsync({ chainId: cronosTestnet.id });
      }
    } catch (e) {
      // ignore; user can still paste header from another agent/wallet
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Premium Data (x402)</h1>

      <button
        onClick={handleUnlock}
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Loading..." : "Unlock Premium"}
      </button>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {requirements && (
        <div className="space-y-3 rounded border p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Payment Requirements</div>
            <NetworkBadge network={requirements.network} />
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <div>
              <span className="font-mono">asset</span>: {requirements.asset}
            </div>
            <div>
              <span className="font-mono">payTo</span>: {requirements.payTo}
            </div>
            <div>
              <span className="font-mono">maxAmountRequired</span>: {requirements.maxAmountRequired}
            </div>
            <div>
              <span className="font-mono">timeout</span>: {requirements.maxTimeoutSeconds}s
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={ensureNetwork}
              className="rounded border px-3 py-1 text-sm"
            >
              Switch to {requirements.network}
            </button>
          </div>

          <div className="pt-4">
            <label className="block text-sm font-medium">X-PAYMENT header (Base64)</label>
            <textarea
              className="mt-1 w-full rounded border p-2 font-mono text-xs"
              rows={4}
              placeholder="eyJ4NDAyVmVyc2lvbiI6MSwic2NoZW1lIjoiZXhhY3QiLC4uLn0="
              value={xPayment}
              onChange={(e) => setXPayment(e.target.value)}
            />
            <div className="pt-2">
              <button
                onClick={handleRetry}
                disabled={loading}
                className="rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {loading ? "Processing..." : "Submit Payment & Retry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-3 rounded border p-4">
          <div className="font-medium">Premium Content</div>
          <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
            {JSON.stringify(result.content, null, 2)}
          </pre>
          {result.settlement && (
            <div className="space-y-1 text-sm text-gray-700">
              <div>
                <span className="font-mono">txHash</span>: {result.settlement.txHash}
              </div>
              <div>
                <span className="font-mono">blockNumber</span>: {result.settlement.blockNumber}
              </div>
              <div>
                <span className="font-mono">amount</span>: {result.settlement.amount}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
