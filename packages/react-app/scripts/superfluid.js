const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const { Web3Provider } = require("@ethersproject/providers");

export const stream = async (
    provider, // web3 provider
    superDepositToken, // token address
    from, // sender 
    recipient, // receiver
    flowRate, // must be positive, negative to flow from "to" to "from"
    ) => {
        
    const sf = new SuperfluidSDK.Framework({
        ethers: new Web3Provider(provider) // or window.ethereum
    });
    await sf.initialize()
          
    const sender = sf.user({
          address: from, // or eth_requestAccounts from web3 provider
          token: superDepositToken
      });

    const details = await sender.details();
    console.log(details);

    await sender.flow({
        recipient: recipient,
        flowRate: flowRate // '385802469135802' tokens per second
    });
    
    const details = await sender.details();
    console.log(details);
}
