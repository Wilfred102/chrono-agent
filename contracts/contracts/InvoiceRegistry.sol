// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract InvoiceRegistry {
    struct Invoice {
        uint256 id;
        address issuer;
        address payer;
        uint256 amount;
        address token; // Address of the token (e.g., USDC), or address(0) for native coin
        uint256 dueDate;
        string metadataHash; // IPFS hash or similar for invoice details
        bool isPaid;
        bool isCancelled;
    }

    uint256 private _nextInvoiceId;
    mapping(uint256 => Invoice) public invoices;

    event InvoiceCreated(uint256 indexed id, address indexed issuer, address indexed payer, uint256 amount, address token, uint256 dueDate);
    event InvoicePaid(uint256 indexed id, address indexed payer);
    event InvoiceCancelled(uint256 indexed id);

    function createInvoice(
        address _payer,
        uint256 _amount,
        address _token,
        uint256 _dueDate,
        string memory _metadataHash
    ) external returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(_payer != address(0), "Invalid payer address");

        uint256 invoiceId = _nextInvoiceId++;
        invoices[invoiceId] = Invoice({
            id: invoiceId,
            issuer: msg.sender,
            payer: _payer,
            amount: _amount,
            token: _token,
            dueDate: _dueDate,
            metadataHash: _metadataHash,
            isPaid: false,
            isCancelled: false
        });

        emit InvoiceCreated(invoiceId, msg.sender, _payer, _amount, _token, _dueDate);
        return invoiceId;
    }

    function markAsPaid(uint256 _invoiceId) external {
        Invoice storage invoice = invoices[_invoiceId];
        require(msg.sender == invoice.issuer, "Only issuer can mark as paid manually");
        require(!invoice.isPaid, "Already paid");
        require(!invoice.isCancelled, "Invoice cancelled");

        invoice.isPaid = true;
        emit InvoicePaid(_invoiceId, invoice.payer);
    }

    function cancelInvoice(uint256 _invoiceId) external {
        Invoice storage invoice = invoices[_invoiceId];
        require(msg.sender == invoice.issuer, "Only issuer can cancel");
        require(!invoice.isPaid, "Cannot cancel paid invoice");

        invoice.isCancelled = true;
        emit InvoiceCancelled(_invoiceId);
    }

    function getInvoice(uint256 _invoiceId) external view returns (Invoice memory) {
        return invoices[_invoiceId];
    }
}
