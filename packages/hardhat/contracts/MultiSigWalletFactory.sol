// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Factory.sol";
import "./MultiSigWallet.sol";
import "./CashflowTokens.sol";


/// @title Multisignature wallet factory - Allows creation of multisig wallet.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWalletFactory is Factory {

    /*
     * Public functions
     */
    function create(address[] memory _owners, uint _required, CashflowTokens _cashflowTokens)
    public
    returns (address wallet)
    {
        wallet = address(new MultiSigWallet(_owners, _required, _cashflowTokens));
        register(wallet);
    }

    function init(address[] memory _owners, uint _required, CashflowTokens _cashflowTokens)
    public
    returns (address wallet)
    {
        wallet = address(new MultiSigWallet(_owners, _required, _cashflowTokens));
        register(wallet);
    }


}
