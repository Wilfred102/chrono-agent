const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

// x402 Facilitator configuration
// Required env vars: FACILITATOR_BASE_URL, X402_NETWORK, X402_PAY_TO, X402_ASSET, X402_MAX_AMOUNT, X402_MAX_TIMEOUT
const FACILITATOR_BASE_URL = process.env.FACILITATOR_BASE_URL || 'https://facilitator.example.com';
const X402_NETWORK = process.env.X402_NETWORK || 'cronos-testnet';
const X402_PAY_TO = process.env.X402_PAY_TO || '0xSeller...';
const X402_ASSET = process.env.X402_ASSET || '0xUSDX...';
const X402_MAX_AMOUNT = process.env.X402_MAX_AMOUNT || '1000000';
const X402_MAX_TIMEOUT = Number(process.env.X402_MAX_TIMEOUT || 300);

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

function paymentRequiredResponse(res) {
  return res.status(402).json({
    error: 'Payment Required',
    x402Version: 1,
    paymentRequirements: buildPaymentRequirements(),
  });
}

async function verifyPaymentHeader(xPaymentBase64) {
  const url = `${FACILITATOR_BASE_URL}/verify`;
  const { data } = await axios.post(url, {
    x402Version: 1,
    paymentHeader: xPaymentBase64,
    requirements: buildPaymentRequirements(),
  }, { timeout: 15000 });
  return data; // expect { valid: true, authorization: { ... }, details: { ... } }
}

async function settlePayment(verification) {
  const url = `${FACILITATOR_BASE_URL}/settle`;
  const { data } = await axios.post(url, {
    x402Version: 1,
    verification,
  }, { timeout: 30000 });
  return data; // expect { txHash, blockNumber, timestamp, amount, from, to, asset }
}

// Example protected resource using x402 flow
// Buyer first GETs this endpoint; if no X-PAYMENT header, we respond 402 with requirements.
// When buyer retries with X-PAYMENT header, we verify with facilitator and then settle on-chain.
app.get('/api/premium-data', async (req, res) => {
  try {
    const xPayment = req.header('X-PAYMENT');
    if (!xPayment) {
      return paymentRequiredResponse(res);
    }

    // 1) Verify the header off-chain via Facilitator
    const verification = await verifyPaymentHeader(xPayment);
    if (!verification || verification.valid !== true) {
      return res.status(400).json({ error: 'Invalid payment header' });
    }

    // 2) Settle on-chain; facilitator pays gas and returns receipt
    const receipt = await settlePayment(verification);

    // 3) Deliver premium content with settlement details
    return res.json({
      content: {
        message: 'Premium dataset access granted',
        data: [
          { id: 1, value: 'alpha' },
          { id: 2, value: 'beta' },
        ],
      },
      settlement: receipt,
    });
  } catch (err) {
    const status = err?.response?.status || 500;
    const detail = err?.response?.data || { error: 'Internal Server Error' };
    return res.status(status).json({ error: 'x402 processing failed', detail });
  }
});

// Optional helper endpoint to query current requirements
app.get('/api/x402/requirements', (req, res) => {
  return res.json({ x402Version: 1, paymentRequirements: buildPaymentRequirements() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
