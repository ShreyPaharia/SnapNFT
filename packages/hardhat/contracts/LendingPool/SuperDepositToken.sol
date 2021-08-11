// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {
    ISuperToken,
    CustomSuperTokenProxyBase
}
from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/CustomSuperTokenProxyBase.sol";
import { INativeSuperTokenCustom } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/tokens/INativeSuperToken.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SuperDepositToken is 
    INativeSuperTokenCustom,
    CustomSuperTokenProxyBase
    {

    // owner/deployer
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // allow only to initialize once
    bool isInitialized;
    // LendingPoolDF
    address lendingPoolDF;

    function initialize(string calldata _name, string calldata _symbol, uint256 initialSupply)
        external override
    {
        require(isInitialized == false, "Already Initialized");
        require(msg.sender == owner, "Only Owner");

        ISuperToken(address(this)).initialize(
            IERC20(address(0)), // no underlying/wrapped token
            18, // shouldn't matter if there's no wrapped token
            _name,
            _symbol
        );

        if(initialSupply > 0) {
            ISuperToken(address(this)).selfMint(msg.sender, initialSupply, new bytes(0));
        }

        isInitialized = true;
    }

    function setLendingPoolDF(address lpdf) external {
        require(isInitialized, "Not Initialized");
        require(msg.sender == owner || msg.sender == lendingPoolDF, "Only LendingPoolDF/Owner");

        lendingPoolDF = lpdf;
    }

    function mint(address account, uint256 amount) external {
        require(isInitialized, "Not Initialized");
        require(msg.sender == owner || msg.sender == lendingPoolDF, "Only LendingPoolDF/Owner");

        ISuperToken(address(this)).selfMint(account, amount, new bytes(0));
    }

    function burn(address account, uint256 amount) external {
        require(isInitialized, "Not Initialized");
        require(msg.sender == owner || msg.sender == lendingPoolDF, "Only LendingPoolDF/Owner");

        ISuperToken(address(this)).selfBurn(account, amount, new bytes(0));
    }

}
