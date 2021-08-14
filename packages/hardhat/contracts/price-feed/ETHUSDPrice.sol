// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AggregatorV3Interface.sol";

contract PriceConsumerV3 {

    AggregatorV3Interface internal priceFeedEth;
    AggregatorV3Interface internal priceFeedMatic;

    /**
     * Network: Mumbai
     * Aggregator: ETH/USD
     * Decimals: 8
     * Address: 0x0715A7794a1dc8e42615F059dD6e406A6594651A
     */

    /* 
     * @notice change address when deploying to mainnet
     */

    constructor() {
        priceFeedEth = AggregatorV3Interface(0x0715A7794a1dc8e42615F059dD6e406A6594651A);
        priceFeedMatic = AggregatorV3Interface(0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada);

    }

    /**
     * Returns the latest price
     */

    function ethPrice() public view returns (int) {
        (, int price , , , ) = priceFeedEth.latestRoundData();
        return price ; // 8 decimals
    }

    function maticPrice() public view returns (int) {
        (, int price , , , ) = priceFeedMatic.latestRoundData();
        return price ; // 8 decimals
    }
}
