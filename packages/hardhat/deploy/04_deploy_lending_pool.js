require('hardhat')

module.exports = async ({ getNamedAccounts, deployments }) => {

    const deployed_SDT = require(`../deployments/${hre.network.name}/SuperDepositToken.json`);
    const deployed_CFT = require(`../deployments/${hre.network.name}/CashflowTokens.json`);

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const LendingPoolDF = await deploy(
        "LendingPoolDF", {
            from: deployer,
            args: [deployed_CFT.address, deployed_SDT.address],
            log: true
        })

    console.log(LendingPoolDF.address)

    const SDT = new ethers.Contract(
        deployed_SDT.address,
        deployed_SDT.abi,
        await ethers.getSigner(deployer)
    );

    const output = await SDT.setLendingPoolDF(LendingPoolDF.address)

    console.log(output)

}

module.exports.tags = ["LendingPoolDF"];
