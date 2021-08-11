// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AggregatorV3Interface.sol";

contract PriceConsumerV3 {

    AggregatorV3Interface internal priceFeed;

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
        priceFeed = AggregatorV3Interface(0x0715A7794a1dc8e42615F059dD6e406A6594651A);
    }

    /**
     * Returns the latest price
     */

    function ethPrice() public view returns (int) {
        (, int price , , , ) = priceFeed.latestRoundData();
        return price / (10**8) ; // 8 decimals
    }
}
