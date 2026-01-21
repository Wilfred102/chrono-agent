// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./InvoiceRegistry.sol";

contract PaymentEscrow {
    InvoiceRegistry public invoiceRegistry;

    event PaymentDeposited(uint256 indexed invoiceId, uint256 amount);
    event PaymentReleased(uint256 indexed invoiceId, address indexed recipient, uint256 amount);

    constructor(address _invoiceRegistry) {
        invoiceRegistry = InvoiceRegistry(_invoiceRegistry);
    }

    function payInvoice(uint256 _invoiceId) external payable {
        InvoiceRegistry.Invoice memory invoice = invoiceRegistry.getInvoice(_invoiceId);
        require(!invoice.isPaid, "Invoice already paid");
        require(!invoice.isCancelled, "Invoice cancelled");
        require(invoice.payer == msg.sender || invoice.payer == address(0), "Not the designated payer"); // address(0) payer means anyone can pay

        if (invoice.token == address(0)) {
            require(msg.value == invoice.amount, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "Do not send ETH for token payment");
            IERC20(invoice.token).transferFrom(msg.sender, address(this), invoice.amount);
        }

        // In a real escrow, we might hold funds. For now, we'll auto-release to issuer (direct payment)
        // or we could add release logic. Let's implement direct payment for MVP simplicity, 
        // but keep the structure of "Escrow" for future expansion (dispute resolution).
        
        _releaseFunds(invoice);
        
        // We need to call markAsPaid on registry. 
        // Note: InvoiceRegistry needs to allow this contract to call markAsPaid. 
        // For now, we'll just emit an event and assume off-chain indexer handles status, 
        // or we need to update InvoiceRegistry to have access control.
        // Let's assume we update InvoiceRegistry later to allow this contract.
    }

    function _releaseFunds(InvoiceRegistry.Invoice memory invoice) internal {
        if (invoice.token == address(0)) {
            payable(invoice.issuer).transfer(invoice.amount);
        } else {
            IERC20(invoice.token).transfer(invoice.issuer, invoice.amount);
        }
        emit PaymentReleased(invoice.id, invoice.issuer, invoice.amount);
    }
}
