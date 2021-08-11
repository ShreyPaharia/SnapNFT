// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma abicoder v2;

import { 
    IERC20,
    ILendingPool,
    IProtocolDataProvider,
    IStableDebtToken,
    IAToken 
} from './Interfaces.sol';

import { SafeERC20 } from './Libraries.sol';

import {CashflowTokens} from '../CashflowTokens.sol';
import {ERC1155Holder} from '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol';
import {ERC777Recipient} from './ERC777Recepient.sol';

import {
    ISuperToken,
    ISuperfluid,
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {
    SuperAppBase
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

interface ISDT is ISuperToken {
    function setLendingPoolDF(address lpdf) external;

    function mint(address account, uint256 amount) external;

    function burn(address account, uint256 amount) external;
}

/**
 * This is a proof of concept starter contract, showing how uncollaterised loans are possible
 * using Aave v2 credit delegation.
 * This example supports stable interest rate borrows.
 * It is not production ready (!). User permissions and user accounting of loans should be implemented.
 * See @dev comments
 */
 
contract LendingPoolDF is ERC1155Holder, SuperAppBase, ERC777Recipient {
    using SafeERC20 for IERC20;

    string name = "Deep Fin Lending Pool";
    uint256 RAY1 = 10**12;
    uint256 RAY2 = 10**15;

    mapping (address => uint256) deposited;

    /* aave & superfluid mumbai addresses */

    address USDC = 0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e;  // ERC20 USDC
    address sUSDC = 0x83A7bC369cFd55D9F00267318b6D221fb9Fa739F; // stable debt USDC token
    address aUSDC = 0x2271e3Fef9e15046d09E1d78a8FF038c691E9Cf9; // aave interest bearing USDC

    ILendingPool lendingPool = ILendingPool(0x9198F13B08E299d85E096929fA9781A1E3d5d827);
    IProtocolDataProvider DataProvider = IProtocolDataProvider(0xFA3bD19110d986c5e5E9DD5F69362d05035D045B);

    IConstantFlowAgreementV1 CFA = IConstantFlowAgreementV1(0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873);
    ISuperfluid host = ISuperfluid(0xEB796bdb90fFA0f28255275e16936D25d3418603);

    /* address to get from constructor */

    ISDT SDT; // super deposit token
    CashflowTokens cashflowTokens;
    address owner;

    constructor (address _cashflowTokens, address _SDT) ERC777Recipient() {
        owner = msg.sender;
        cashflowTokens = CashflowTokens(_cashflowTokens);
        SDT = ISDT(_SDT);

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL;
        host.registerApp(configWord);
    }

    /**
     * Deposits collateral into the Aave, to enable credit delegation
     * This would be called by the delegator.
     * @param asset The asset to be deposited as collateral
     * @param amount The amount to be deposited as collateral
     * @param isPull Whether to pull the funds from the caller, or use funds sent to this contract
     *  User must have approved this contract to pull funds if `isPull` = true
     * 
     */
    function depositCollateral(address asset, uint256 amount, bool isPull) public {
        if (isPull) {
            IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        }

        IERC20(asset).safeApprove(address(lendingPool), amount);
        lendingPool.deposit(asset, amount, address(this), 0);

        deposited[msg.sender] += amount;

        SDT.mint(msg.sender, amount*RAY1);

        (, , , uint256 liquidityRate, , , , , , ) = DataProvider.getReserveData(asset);
        uint256 APY = liquidityRate / RAY1 ;

        // 1 year = 31536000 seconds
        // flow per second = (APY/31536000)*amount (divdide before multiply, solidity truncate)

        // mint 10 years worth of interest equivalent of super tokens extra,
        // incase if interest rate fluctuate heavily
        // if unused until stream ends, it will stay in this contract

        SDT.mint(address(this), APY*10*amount*RAY1);

        bytes memory ctx = CFA.createFlow(
                            ISuperToken(SDT),
                            msg.sender,
                            int96(int(APY/31536000)*int((amount*RAY1)/RAY2)),
                            new bytes(0)
                        );

    }

    /**
     * Withdraw all of a collateral as the underlying asset, if no outstanding loans delegated
     * 
     * Add permissions to this call, e.g. only the owner should be able to withdraw the collateral!
     */
    function withdrawCollateral() public {

        // withdraw whole amount,
        // change later to withdraw partial
        require(deposited[msg.sender] > 0, "No deposits");

        SDT.burn(msg.sender, deposited[msg.sender]*RAY1);

        uint256 usdcDeposited = deposited[msg.sender];
        deposited[msg.sender] = 0;

        lendingPool.withdraw(address(USDC), usdcDeposited, msg.sender);

        
        bytes memory ctx2 = CFA.deleteFlow(
                            ISuperToken(SDT),
                            address(this),
                            msg.sender,
                            new bytes(0)
                        );

    }

    /**
     * Approves the borrower to take an uncollaterised loan
     * @param borrower The borrower of the funds (i.e. delgatee)
     * @param amount The amount the borrower is allowed to borrow (i.e. their line of credit)
     * 
     * Add permissions to this call, e.g. only the owner should be able to approve borrowers!
     */
    function approveBorrower(address borrower, uint256 amount, uint256 tokenId) public {

        // transfer cashflow tokens (i.e lock)
        cashflowTokens.safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            amount,
            new bytes(0)
        );

        // modify the amount to charge fees
        uint256 loanAmount = (amount*9)/10;

        IStableDebtToken(sUSDC).approveDelegation(borrower, loanAmount);
    }
    
    /**
     * Repay an uncollaterised loan
     * @param amount The amount to repay
     * @param asset The asset to be repaid
     * 
     * User calling this function must have approved this contract with an allowance to transfer the tokens
     * 
     * You should keep internal accounting of borrowers, if your contract will have multiple borrowers
     */
    function repayBorrower(uint256 amount, address asset) public {

        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(asset).safeApprove(address(lendingPool), amount);

        lendingPool.repay(asset, amount, 1, address(this));
    }

    function getUnderlying(address account) external view returns (uint256) {
        return deposited[account];
    }

}
