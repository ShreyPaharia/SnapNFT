// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IERC777Recipient} from '@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol';
import {IERC1820Registry} from '@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol';

contract ERC777Recipient is IERC777Recipient {

    IERC1820Registry private _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
    bytes32 constant private TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");

    event Received(address operator, address from, address to, uint256 amount, bytes userData, bytes operatorData);

    constructor () {
        _erc1820.setInterfaceImplementer(address(this), TOKENS_RECIPIENT_INTERFACE_HASH, address(this));
    }

    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external override {
        emit Received(operator, from, to, amount, userData, operatorData);
    }
}
