// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDC is ERC20 {
    
    string NAME = "USDC";
    string SYMBOL = "USDC";

    constructor()
        ERC20(NAME, SYMBOL)
    {
        _mint(_msgSender(),10000000000000000000000);
    }

}