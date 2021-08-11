// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {USDC} from './USDC.sol';

contract CashflowTokens is ERC1155 {

    struct TokenMetaData {
        string invoiceHash;
        string legalContractHash;
        address anchor;
        address supplier;
        uint256 totalSupply;
        uint256 paymentDate;
        bool isRepaid;
    }

    string public name = "Cashflow Tokens";
    string public symbol = "cToken";
    uint256 public lastTokenId;
    USDC public usdcToken;
    address public owner;
    mapping (uint256 => TokenMetaData) public tokenMetaData;

    

    //save owner address 
    //save stablecoin class

    constructor(USDC _usdcToken, string memory _uri) ERC1155(_uri) {
        lastTokenId = 0;
        owner = msg.sender;
        usdcToken = _usdcToken;
        // totalSupply[lastTokenId] = 1;
        // _mint(msg.sender, lastTokenId, 1, "");

    }

    function mint(
        string memory _invoiceHash,
        string memory _legalContractHash,
        address _anchor,
        address _supplier,
        uint256 _totalSupply,
        uint256 _paymentDate
    ) public returns(bool) {
        lastTokenId++;
        TokenMetaData memory lastTokenMetaData = TokenMetaData(_invoiceHash,_legalContractHash,_anchor,_supplier,_totalSupply,_paymentDate,false);
        tokenMetaData[lastTokenId] = lastTokenMetaData;
        _mint(_supplier, lastTokenId, _totalSupply, "");
        return true;
    }


    function repay(
        address _account,
        uint256 _tokenId
    ) public returns(bool) {
        
        //check balance - total balance should be greater than the total supply for the coin
        uint256 balance = usdcToken.balanceOf(_account);
        require(balance>=tokenMetaData[_tokenId].totalSupply, "Balance is not enough, please make sure you have USDC");

        //transfer stablecoin from this account to owner account 
        usdcToken.transferFrom(_account,address(this),tokenMetaData[_tokenId].totalSupply);

        //TODO:update the status to repaid
        tokenMetaData[_tokenId].isRepaid = true;

        return true;

    }


        function repayCircle(
        uint256 _tokenId
    ) public returns(bool) {
        
        tokenMetaData[_tokenId].isRepaid = true;

        return true;

    }

    function redeem(
        address _account,
        uint256 _tokenId
    ) public returns (bool){
        uint256 balance = balanceOf(_account, _tokenId);

        //check cashflow token balance & repaid status for nft
        require(balance>0, "No tokens available to redeem");
        require(tokenMetaData[_tokenId].isRepaid==true,"Token cannot be redeemed if not repaid");

        //burn all tokens
        _burn(_account,_tokenId,balance);
        //transfer required amount of stable coins from account to owner

        usdcToken.transfer(_account, balance);

        return true;

    }

    function decimals() public pure returns (uint8){
        return 18;
    }


    function getAllTransactions(
    )
    public
    view
    returns (TokenMetaData[] memory)
    {
        TokenMetaData[] memory _transactions = new TokenMetaData[](lastTokenId+1);
        for (uint256 i=0; i<=lastTokenId; i++) {
                _transactions[i] = tokenMetaData[i];
        }
        return _transactions;
    }

    function getAllBalances(
        address _account
    )
    public
    view
    returns (uint256[] memory)
    {
        uint256[] memory balances = new uint256[](lastTokenId+1);
        for (uint256 i=0; i<=lastTokenId; i++) {
                balances[i] = balanceOf(_account, i);
        }
        return balances;
    }

}
