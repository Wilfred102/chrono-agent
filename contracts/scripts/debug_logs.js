const hre = require("hardhat");

async function main() {
    const invoiceRegistryAddress = "0x9758D59d7B3edb38AaDBdE0BaAd5E136D1ce42AD"; // Address from deployment
    const InvoiceRegistry = await hre.ethers.getContractFactory("InvoiceRegistry");
    const invoiceRegistry = InvoiceRegistry.attach(invoiceRegistryAddress);

    console.log("Fetching logs for InvoiceRegistry at:", invoiceRegistryAddress);

    // Get all InvoiceCreated events
    // Filter: id, issuer, payer
    // We want to see ALL events first to ensure the contract is emitting them
    const filter = invoiceRegistry.filters.InvoiceCreated();

    // Get current block
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    console.log("Current block:", currentBlock);

    // Query last 100 blocks
    const fromBlock = currentBlock - 100;
    console.log(`Querying from block ${fromBlock} to ${currentBlock}`);

    const logs = await invoiceRegistry.queryFilter(filter, fromBlock, currentBlock);

    console.log(`Found ${logs.length} InvoiceCreated events.`);

    logs.forEach((log) => {
        console.log("------------------------------------------------");
        console.log("Block Number:", log.blockNumber);
        console.log("Transaction Hash:", log.transactionHash);
        console.log("Args:", log.args);
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
