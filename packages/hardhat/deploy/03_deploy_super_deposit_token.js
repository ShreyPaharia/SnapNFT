module.exports = async ({ getNamedAccounts, deployments, getSigner, getContract }) => {

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const IST = require('../artifacts/contracts/LendingPool/ISuperTokenFactory.sol/ISuperTokenFactory.json')
    const INST = require('../artifacts/contracts/LendingPool/ISuperTokenFactory.sol/INativeSuperTokenCustom.json')

    const initialSupply = "10000000000000000000";
    const superTokenSymbol = "Super Deposit Token";
    const superTokenName = "SDT";

    // SuperTokenFactory (at) -> 
    // NativeSuperTokenProxy (deploy) -> 
    // SuperTokenCustom(at, proxy.address) ->
    // SuperTokenFactory.initializeCustomSuperToken -> 
    // SuperTokenCustom.initialize

    const SuperTokenFactory = new ethers.Contract(
        "0x200657E2f123761662567A1744f9ACAe50dF47E6", // change as per chain
        IST.abi,
        await ethers.getSigner(deployer)
    );

    const NativeSuperTokenProxy = await deploy(
        "SuperDepositToken", {
            from: deployer,
            log: true
        })

    const token = new ethers.Contract(
        NativeSuperTokenProxy.address,
        INST.abi,
        await ethers.getSigner(deployer)
    );

    await SuperTokenFactory.initializeCustomSuperToken(token.address);

    await token.initialize(
        superTokenName,
        superTokenSymbol,
        initialSupply, {
            gasLimit: 300000
        }
    );

}

module.exports.tags = ["SuperDepositToken"];
