// deploy/00_deploy_your_contract.js

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer,anchor,supplier1,supplier2 } = await getNamedAccounts();
    await deploy("USDC", {
      from: deployer,
      log: true,
    });

    const usdc = await ethers.getContract("USDC", deployer);

    await deploy("CashflowTokens", {
        from: deployer,
        args:[usdc.address,"http://localhost:3500/api/tokens/{id}"],
        log: true,
      });

      const cashflowTokens = await ethers.getContract("CashflowTokens", deployer);


      await deploy("MultiSigWallet", {
        from: deployer,
        args: [[anchor],1,cashflowTokens.address],
        log: true,
      });

      const multiSigWallet = await ethers.getContract("MultiSigWallet", deployer);
      // await multiSigWallet.addSupplier(supplier1);
      // await multiSigWallet.addSupplier(supplier2);

      await deploy("MultiSigWalletFactory", {
        from: deployer,
        log: true,
      });

      // await usdc.transfer(anchor,'5000000000000000000000')

      
      console.log("Deployer: ",deployer)
      console.log("Anchor: ",anchor)
      console.log("Supplier: ",supplier1)


  
    /*
      // Getting a previously deployed contract
      const YourContract = await ethers.getContract("YourContract", deployer);
      await YourContract.setPurpose("Hello");
      
      //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
    */
  };
  module.exports.tags = ["CashflowTokens"];
  
  /*
  Tenderly verification
  let verification = await tenderly.verify({
    name: contractName,
    address: contractAddress,
    network: targetNetwork,
  });
  */
  