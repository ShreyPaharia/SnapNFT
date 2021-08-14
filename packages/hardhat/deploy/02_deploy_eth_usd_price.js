module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy("PriceConsumerV3", {
        from: deployer,
        log: true,
      });

    const PriceConsumerV3 = await ethers.getContract("PriceConsumerV3", deployer);
    const price = await PriceConsumerV3.ethPrice();
    console.log("ETH PRICE: " + price);
}

module.exports.tags = ["PriceConsumerV3"];
