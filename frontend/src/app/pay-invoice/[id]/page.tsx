'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { formatUnits, parseUnits, erc20Abi, zeroAddress } from 'viem';
import { CONTRACTS } from '@/config/contracts';
import { getInvoicePayRequirements, generatePaymentHeader, postInvoicePaymentHeader } from '@/lib/x402';

export default function PayInvoice() {
    const params = useParams();
    const id = BigInt(params.id as string);
    const { address: userAddress } = useAccount();

    // Fetch Invoice Details
    const { data: invoice, isLoading: isLoadingInvoice, refetch: refetchInvoice } = useReadContract({
        address: CONTRACTS.InvoiceRegistry.address,
        abi: CONTRACTS.InvoiceRegistry.abi,
        functionName: 'getInvoice',
        args: [id],
    });

    // Write Contract Hooks
    const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    // State for ERC20 Allowance
    const [allowance, setAllowance] = useState<bigint>(0n);
    const [x402Loading, setX402Loading] = useState(false);
    const [x402Error, setX402Error] = useState<string | null>(null);

    // Check Allowance if token is not native
    const isNativeToken = invoice?.token === zeroAddress;

    const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
        address: invoice?.token as `0x${string}`,
        abi: erc20Abi,
        functionName: 'allowance',
        args: userAddress && invoice?.token ? [userAddress, CONTRACTS.PaymentEscrow.address] : undefined,
        query: {
            enabled: !isNativeToken && !!invoice?.token && !!userAddress,
        }
    });

    useEffect(() => {
        if (allowanceData) setAllowance(allowanceData);
    }, [allowanceData]);

    useEffect(() => {
        if (isConfirmed) {
            refetchInvoice();
            refetchAllowance();
        }
    }, [isConfirmed, refetchInvoice, refetchAllowance]);

    const handleApprove = () => {
        if (!invoice) return;
        writeContract({
            address: invoice.token as `0x${string}`,
            abi: erc20Abi,
            functionName: 'approve',
            args: [CONTRACTS.PaymentEscrow.address, invoice.amount],
        });
    };

    const handlePay = () => {
        if (!invoice) return;

        if (isNativeToken) {
            writeContract({
                address: CONTRACTS.PaymentEscrow.address,
                abi: CONTRACTS.PaymentEscrow.abi,
                functionName: 'payInvoice',
                args: [id],
                value: invoice.amount,
            });
        } else {
            writeContract({
                address: CONTRACTS.PaymentEscrow.address,
                abi: CONTRACTS.PaymentEscrow.abi,
                functionName: 'payInvoice',
                args: [id],
            });
        }
    };

    // x402 Micropayment flow: verify/settle via facilitator and mark invoice as paid
    const handlePayViaX402 = async () => {
        if (!invoice) return;
        setX402Loading(true);
        setX402Error(null);
        try {
            // 1) Ask backend for dynamic requirements for this invoice (expects 402)
            const res = await getInvoicePayRequirements(params.id as string);
            if (res.status !== 402) {
                throw new Error('Unexpected response; invoice may already be paid or not found');
            }

            // 2) Generate Base64 X-PAYMENT header using connected wallet
            const header = await generatePaymentHeader(res.requirements);

            // 3) Submit header to backend to verify, settle, and mark paid
            await postInvoicePaymentHeader(params.id as string, header);

            // 4) Refresh UI state
            await refetchInvoice();
            await refetchAllowance();
        } catch (e: any) {
            setX402Error(e?.message || 'x402 payment failed');
        } finally {
            setX402Loading(false);
        }
    };

    if (isLoadingInvoice) return <div className="p-8 text-white">Loading invoice...</div>;
    if (!invoice) return <div className="p-8 text-white">Invoice not found</div>;

    const isPaid = invoice.isPaid;
    const isCancelled = invoice.isCancelled;
    const needsApproval = !isNativeToken && allowance < invoice.amount;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8 shadow-xl">
                <h1 className="text-3xl font-bold mb-6">Pay Invoice #{params.id}</h1>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Description</span>
                        <span className="font-medium">
                            {invoice.metadataHash.split('| PoW:')[0]}
                            {invoice.metadataHash.includes('| PoW:') && (
                                <div className="mt-1">
                                    <a
                                        href={invoice.metadataHash.split('| PoW:')[1].trim()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-400 hover:text-blue-300 underline"
                                    >
                                        View Proof of Work ↗
                                    </a>
                                </div>
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Amount</span>
                        <span className="text-2xl font-bold text-green-400">
                            {formatUnits(invoice.amount, 6)} {isNativeToken ? 'CRO' : 'USDC'}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Issuer</span>
                        <span className="font-mono text-sm">{invoice.issuer}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Payer</span>
                        <span className="font-mono text-sm">{invoice.payer}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Status</span>
                        <span className={`font-bold ${isPaid ? 'text-green-500' : isCancelled ? 'text-red-500' : 'text-yellow-500'}`}>
                            {isPaid ? 'PAID' : isCancelled ? 'CANCELLED' : 'PENDING'}
                        </span>
                    </div>
                </div>

                {!isPaid && !isCancelled && (
                    <div className="space-y-4">
                        <button
                            onClick={handlePayViaX402}
                            disabled={x402Loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded transition disabled:opacity-50"
                        >
                            {x402Loading ? 'Processing via x402...' : 'Pay via x402 (Micropayment)'}
                        </button>
                        {needsApproval ? (
                            <button
                                onClick={handleApprove}
                                disabled={isPending || isConfirming}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded transition disabled:opacity-50"
                            >
                                {isPending ? 'Approving...' : isConfirming ? 'Waiting for Approval...' : 'Approve Token'}
                            </button>
                        ) : (
                            <button
                                onClick={handlePay}
                                disabled={isPending || isConfirming}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition disabled:opacity-50"
                            >
                                {isPending ? 'Processing...' : isConfirming ? 'Confirming Payment...' : 'Pay Invoice'}
                            </button>
                        )}

                        {writeError && (
                            <div className="text-red-500 text-sm mt-2">
                                Error: {writeError.message.split('\n')[0]}
                            </div>
                        )}
                        {x402Error && (
                            <div className="text-red-500 text-sm mt-2">
                                x402 Error: {x402Error}
                            </div>
                        )}
                    </div>
                )}

                {isPaid && (
                    <div className="bg-green-900/30 border border-green-500 text-green-400 p-4 rounded text-center">
                        This invoice has been paid.
                    </div>
                )}
            </div>
        </div>
    );
}