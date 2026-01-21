const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy InvoiceRegistry
    const InvoiceRegistry = await hre.ethers.getContractFactory("InvoiceRegistry");
    const invoiceRegistry = await InvoiceRegistry.deploy();
    await invoiceRegistry.waitForDeployment();
    const invoiceRegistryAddress = await invoiceRegistry.getAddress();
    console.log("InvoiceRegistry deployed to:", invoiceRegistryAddress);

    // Deploy PaymentEscrow
    const PaymentEscrow = await hre.ethers.getContractFactory("PaymentEscrow");
    const paymentEscrow = await PaymentEscrow.deploy(invoiceRegistryAddress);
    await paymentEscrow.waitForDeployment();
    console.log("PaymentEscrow deployed to:", await paymentEscrow.getAddress());

    // Deploy RevenueSplitter
    const RevenueSplitter = await hre.ethers.getContractFactory("RevenueSplitter");
    const revenueSplitter = await RevenueSplitter.deploy();
    await revenueSplitter.waitForDeployment();
    console.log("RevenueSplitter deployed to:", await revenueSplitter.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
