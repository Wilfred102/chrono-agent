// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RevenueSplitter {
    event RevenueSplit(address indexed from, address[] recipients, uint256[] amounts);

    function splitPayment(
        address _token,
        address[] calldata _recipients,
        uint256[] calldata _amounts
    ) external payable {
        require(_recipients.length == _amounts.length, "Mismatched arrays");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalAmount += _amounts[i];
        }

        if (_token == address(0)) {
            require(msg.value == totalAmount, "Incorrect ETH amount");
            for (uint256 i = 0; i < _recipients.length; i++) {
                payable(_recipients[i]).transfer(_amounts[i]);
            }
        } else {
            require(msg.value == 0, "Do not send ETH");
            IERC20 token = IERC20(_token);
            token.transferFrom(msg.sender, address(this), totalAmount);
            for (uint256 i = 0; i < _recipients.length; i++) {
                token.transfer(_recipients[i], _amounts[i]);
            }
        }

        emit RevenueSplit(msg.sender, _recipients, _amounts);
    }
}
