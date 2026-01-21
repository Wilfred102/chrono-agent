const OpenAI = require('openai');

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function parseIntent(userQuery) {
    // Mock implementation for now
    // In real implementation, use OpenAI to extract:
    // - Intent: "create_invoice", "pay_invoice", "check_status"
    // - Entities: amount, currency, recipient, description

    return {
        intent: "create_invoice",
        details: {
            amount: 100,
            currency: "USDC",
            recipient: "0x...",
            description: "Web design services"
        }
    };
}

module.exports = { parseIntent };
