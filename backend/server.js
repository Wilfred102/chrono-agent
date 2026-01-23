// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const axios = require('axios');
// const { createClient } = require('@supabase/supabase-js');
// const { ethers } = require('ethers');

// // Load environment variables
// dotenv.config();

// // Initialize Express app
// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // x402 Facilitator configuration
// // Required env vars: FACILITATOR_BASE_URL, X402_NETWORK, X402_PAY_TO, X402_ASSET, X402_MAX_AMOUNT, X402_MAX_TIMEOUT
// const FACILITATOR_BASE_URL = process.env.FACILITATOR_BASE_URL || 'https://facilitator.example.com';
// const X402_NETWORK = process.env.X402_NETWORK || 'cronos-testnet';
// const X402_PAY_TO = process.env.X402_PAY_TO || '0xSeller...';
// const X402_ASSET = process.env.X402_ASSET || '0xUSDX...';
// const X402_MAX_AMOUNT = process.env.X402_MAX_AMOUNT || '1000000';
// const X402_MAX_TIMEOUT = Number(process.env.X402_MAX_TIMEOUT || 300);

// // Chain config for server-side settlement bookkeeping (marking invoices paid)
// const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
// const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY || '';
// const INVOICE_REGISTRY_ADDRESS = process.env.INVOICE_REGISTRY_ADDRESS || '0x9758D59d7B3edb38AaDBdE0BaAd5E136D1ce42AD';

// // Minimal ABI for InvoiceRegistry (getInvoice, markAsPaid)
// const INVOICE_REGISTRY_ABI = [
//   {
//     inputs: [{ internalType: 'uint256', name: '_invoiceId', type: 'uint256' }],
//     name: 'getInvoice',
//     outputs: [
//       {
//         components: [
//           { internalType: 'uint256', name: 'id', type: 'uint256' },
//           { internalType: 'address', name: 'issuer', type: 'address' },
//           { internalType: 'address', name: 'payer', type: 'address' },
//           { internalType: 'uint256', name: 'amount', type: 'uint256' },
//           { internalType: 'address', name: 'token', type: 'address' },
//           { internalType: 'uint256', name: 'dueDate', type: 'uint256' },
//           { internalType: 'string', name: 'metadataHash', type: 'string' },
//           { internalType: 'bool', name: 'isPaid', type: 'bool' },
//           { internalType: 'bool', name: 'isCancelled', type: 'bool' },
//         ],
//         internalType: 'struct Invoice',
//         name: '',
//         type: 'tuple',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [{ internalType: 'uint256', name: '_invoiceId', type: 'uint256' }],
//     name: 'markAsPaid',
//     outputs: [],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
// ];

// // Ethers setup
// const provider = new ethers.JsonRpcProvider(RPC_URL);
// const signer = SERVER_PRIVATE_KEY ? new ethers.Wallet(SERVER_PRIVATE_KEY, provider) : null;
// const invoiceRegistry = new ethers.Contract(INVOICE_REGISTRY_ADDRESS, INVOICE_REGISTRY_ABI, signer || provider);

// function buildPaymentRequirements() {
//   return {
//     scheme: 'exact',
//     network: X402_NETWORK,
//     payTo: X402_PAY_TO,
//     asset: X402_ASSET,
//     maxAmountRequired: X402_MAX_AMOUNT,
//     maxTimeoutSeconds: X402_MAX_TIMEOUT,
//   };
// }

// // Helper functions for payment verification and settlement
// async function verifyPaymentHeader(paymentHeader) {
//   // TODO: Implement actual verification with facilitator
//   // This should call the facilitator API to verify the payment header
//   try {
//     const response = await axios.post(`${FACILITATOR_BASE_URL}/verify`, {
//       paymentHeader,
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Payment verification failed:', error);
//     return null;
//   }
// }

// async function settlePayment(verification) {
//   // TODO: Implement actual settlement with facilitator
//   // This should call the facilitator API to settle the payment
//   try {
//     const response = await axios.post(`${FACILITATOR_BASE_URL}/settle`, {
//       verification,
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Payment settlement failed:', error);
//     throw error;
//   }
// }

// // Optional helper endpoint to query current requirements
// app.get('/api/x402/requirements', (req, res) => {
//   return res.json({ x402Version: 1, paymentRequirements: buildPaymentRequirements() });
// });

// // ---------- x402 for invoice micro-payments ----------
// async function getInvoiceFor(id) {
//   const inv = await invoiceRegistry.getInvoice(id);
//   return {
//     id: inv.id,
//     issuer: inv.issuer,
//     payer: inv.payer,
//     amount: inv.amount, // BigInt
//     token: inv.token,
//     dueDate: inv.dueDate,
//     metadataHash: inv.metadataHash,
//     isPaid: inv.isPaid,
//     isCancelled: inv.isCancelled,
//   };
// }

// function buildInvoiceRequirements(invoice) {
//   return {
//     scheme: 'exact',
//     network: X402_NETWORK,
//     payTo: invoice.issuer, // pay directly to issuer
//     asset: invoice.token,
//     maxAmountRequired: invoice.amount.toString(),
//     maxTimeoutSeconds: X402_MAX_TIMEOUT,
//   };
// }

// // GET returns 402 with dynamic requirements for a given invoice
// app.get('/api/invoices/:id/pay', async (req, res) => {
//   try {
//     const id = BigInt(req.params.id);
//     const invoice = await getInvoiceFor(id);
//     if (!invoice || invoice.isCancelled) return res.status(404).json({ error: 'Invoice not found' });
//     if (invoice.isPaid) return res.status(400).json({ error: 'Invoice already paid' });

//     // Always prompt client to provide X-PAYMENT for this invoice
//     return res.status(402).json({
//       error: 'Payment Required',
//       x402Version: 1,
//       paymentRequirements: buildInvoiceRequirements(invoice),
//       invoice: { 
//         id: invoice.id.toString(), 
//         issuer: invoice.issuer, 
//         payer: invoice.payer, 
//         token: invoice.token, 
//         amount: invoice.amount.toString() 
//       },
//     });
//   } catch (err) {
//     console.error('Invoice requirements error:', err);
//     const status = err?.response?.status || 500;
//     const detail = err?.response?.data || { error: 'Internal Server Error' };
//     return res.status(status).json({ error: 'x402 invoice requirements failed', detail });
//   }
// });

// // POST verifies X-PAYMENT via facilitator, settles, then marks invoice as paid on-chain
// app.post('/api/invoices/:id/pay', async (req, res) => {
//   try {
//     const id = BigInt(req.params.id);
//     const { paymentHeader } = req.body || {};
//     if (!paymentHeader) return res.status(400).json({ error: 'Missing paymentHeader' });

//     const invoice = await getInvoiceFor(id);
//     if (!invoice || invoice.isCancelled) return res.status(404).json({ error: 'Invoice not found' });
//     if (invoice.isPaid) return res.status(400).json({ error: 'Invoice already paid' });

//     // Verify off-chain
//     const requirements = buildInvoiceRequirements(invoice);
//     const verification = await verifyPaymentHeader(paymentHeader);
//     if (!verification || verification.valid !== true) {
//       return res.status(400).json({ error: 'Invalid payment header' });
//     }

//     // Settle via facilitator (pays gas)
//     const receipt = await settlePayment(verification);

//     // Mark invoice as paid on-chain (server signs)
//     if (!signer) return res.status(500).json({ error: 'Server signer not configured' });
//     const tx = await invoiceRegistry.connect(signer).markAsPaid(id);
//     const mined = await tx.wait();

//     return res.json({
//       ok: true,
//       settlement: receipt,
//       markAsPaidTx: mined?.hash || tx.hash,
//     });
//   } catch (err) {
//     console.error('Invoice payment error:', err);
//     const status = err?.response?.status || 500;
//     const detail = err?.response?.data || { error: 'Internal Server Error' };
//     return res.status(status).json({ error: 'x402 invoice payment failed', detail });
//   }
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`x402 Network: ${X402_NETWORK}`);
//   console.log(`Invoice Registry: ${INVOICE_REGISTRY_ADDRESS}`);
// });


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { ethers } = require('ethers');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// x402 Facilitator configuration
// Required env vars: FACILITATOR_BASE_URL, X402_NETWORK, X402_PAY_TO, X402_ASSET, X402_MAX_AMOUNT, X402_MAX_TIMEOUT
const FACILITATOR_BASE_URL = process.env.FACILITATOR_BASE_URL || 'https://facilitator.example.com';
const X402_NETWORK = process.env.X402_NETWORK || 'cronos-testnet';
const X402_PAY_TO = process.env.X402_PAY_TO || '0xSeller...';
const X402_ASSET = process.env.X402_ASSET || '0xUSDX...';
const X402_MAX_AMOUNT = process.env.X402_MAX_AMOUNT || '1000000';
const X402_MAX_TIMEOUT = Number(process.env.X402_MAX_TIMEOUT || 300);

// Chain config for server-side settlement bookkeeping (marking invoices paid)
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY || '';
const INVOICE_REGISTRY_ADDRESS = process.env.INVOICE_REGISTRY_ADDRESS || '0x9758D59d7B3edb38AaDBdE0BaAd5E136D1ce42AD';

// Minimal ABI for InvoiceRegistry (getInvoice, markAsPaid)
const INVOICE_REGISTRY_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: '_invoiceId', type: 'uint256' }],
    name: 'getInvoice',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'address', name: 'issuer', type: 'address' },
          { internalType: 'address', name: 'payer', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'address', name: 'token', type: 'address' },
          { internalType: 'uint256', name: 'dueDate', type: 'uint256' },
          { internalType: 'string', name: 'metadataHash', type: 'string' },
          { internalType: 'bool', name: 'isPaid', type: 'bool' },
          { internalType: 'bool', name: 'isCancelled', type: 'bool' },
        ],
        internalType: 'struct Invoice',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_invoiceId', type: 'uint256' }],
    name: 'markAsPaid',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// Ethers setup
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = SERVER_PRIVATE_KEY ? new ethers.Wallet(SERVER_PRIVATE_KEY, provider) : null;
const invoiceRegistry = new ethers.Contract(INVOICE_REGISTRY_ADDRESS, INVOICE_REGISTRY_ABI, signer || provider);

// Build payment requirements for general x402 endpoints
function buildPaymentRequirements() {
  return {
    scheme: 'exact',
    network: X402_NETWORK,
    payTo: X402_PAY_TO,
    asset: X402_ASSET,
    maxAmountRequired: X402_MAX_AMOUNT,
    maxTimeoutSeconds: X402_MAX_TIMEOUT,
  };
}

// Build payment requirements specific to an invoice
function buildInvoiceRequirements(invoice) {
  return {
    scheme: 'exact',
    network: X402_NETWORK,
    payTo: invoice.issuer, // pay directly to issuer
    asset: invoice.token,
    maxAmountRequired: invoice.amount.toString(),
    maxTimeoutSeconds: X402_MAX_TIMEOUT,
  };
}

// Fetch invoice details from on-chain registry
async function getInvoiceFor(id) {
  const inv = await invoiceRegistry.getInvoice(id);
  return {
    id: inv.id,
    issuer: inv.issuer,
    payer: inv.payer,
    amount: inv.amount, // BigInt
    token: inv.token,
    dueDate: inv.dueDate,
    metadataHash: inv.metadataHash,
    isPaid: inv.isPaid,
    isCancelled: inv.isCancelled,
  };
}

// Verify payment header with facilitator
async function verifyPaymentHeader(paymentHeader, requirements) {
  try {
    const response = await axios.post(
      `${FACILITATOR_BASE_URL}/verify`,
      { requirements },
      {
        headers: {
          'X-PAYMENT': paymentHeader,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const data = error?.response?.data;
    console.error('Payment verification failed:', status, data || error?.message || error);
    return null;
  }
}

// Settle payment via facilitator
async function settlePayment(verification) {
  try {
    const response = await axios.post(`${FACILITATOR_BASE_URL}/settle`, {
      verification,
    });
    return response.data;
  } catch (error) {
    console.error('Payment settlement failed:', error?.response?.data || error?.message || error);
    throw error;
  }
}

// Optional helper endpoint to query current requirements
app.get('/api/x402/requirements', (req, res) => {
  return res.json({ 
    x402Version: 1, 
    paymentRequirements: buildPaymentRequirements() 
  });
});

// GET invoice payment endpoint - returns 402 with dynamic requirements
app.get('/api/invoices/:id/pay', async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const invoice = await getInvoiceFor(id);
    
    if (!invoice || invoice.isCancelled) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    if (invoice.isPaid) {
      return res.status(400).json({ error: 'Invoice already paid' });
    }

    // Return 402 Payment Required with invoice-specific requirements
    return res.status(402).json({
      error: 'Payment Required',
      x402Version: 1,
      paymentRequirements: buildInvoiceRequirements(invoice),
      invoice: { 
        id: invoice.id.toString(), 
        issuer: invoice.issuer, 
        payer: invoice.payer, 
        token: invoice.token, 
        amount: invoice.amount.toString(),
        dueDate: invoice.dueDate.toString(),
      },
    });
  } catch (err) {
    console.error('Invoice requirements error:', err);
    return res.status(500).json({ 
      error: 'Failed to fetch invoice requirements', 
      detail: err?.message || 'Internal Server Error' 
    });
  }
});

// POST invoice payment endpoint - verifies X-PAYMENT, settles, marks as paid
app.post('/api/invoices/:id/pay', async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const { paymentHeader } = req.body || {};
    
    if (!paymentHeader) {
      return res.status(400).json({ error: 'Missing paymentHeader in request body' });
    }

    // Fetch invoice from on-chain registry
    const invoice = await getInvoiceFor(id);
    
    if (!invoice || invoice.isCancelled) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    if (invoice.isPaid) {
      return res.status(400).json({ error: 'Invoice already paid' });
    }

    // Verify payment header with facilitator
    const requirements = buildInvoiceRequirements(invoice);
    const verification = await verifyPaymentHeader(paymentHeader, requirements);
    
    if (!verification || verification.valid !== true) {
      return res.status(400).json({ 
        error: 'Invalid payment header', 
        detail: verification || null 
      });
    }

    // Settle payment via facilitator (facilitator pays gas)
    const receipt = await settlePayment(verification);

    // Mark invoice as paid on-chain (server signs transaction)
    if (!signer) {
      return res.status(500).json({ error: 'Server signer not configured' });
    }
    
    const tx = await invoiceRegistry.connect(signer).markAsPaid(id);
    const mined = await tx.wait();

    return res.json({
      ok: true,
      settlement: receipt,
      markAsPaidTx: mined?.hash || tx.hash,
      invoice: {
        id: invoice.id.toString(),
        isPaid: true,
      },
    });
  } catch (err) {
    console.error('Invoice payment error:', err);
    const status = err?.response?.status || 500;
    const detail = err?.response?.data || err?.message || 'Internal Server Error';
    return res.status(status).json({ 
      error: 'Invoice payment failed', 
      detail 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    network: X402_NETWORK,
    invoiceRegistry: INVOICE_REGISTRY_ADDRESS,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`x402 Network: ${X402_NETWORK}`);
  console.log(`Invoice Registry: ${INVOICE_REGISTRY_ADDRESS}`);
  console.log(`Facilitator: ${FACILITATOR_BASE_URL}`);
});