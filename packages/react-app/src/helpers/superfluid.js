import SuperfluidSDK from '@superfluid-finance/js-sdk';

let tokenNames = ['fDAI'];
let superTokenAddressMap = {};
superTokenAddressMap['fDAI'] = "0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f";

export async function startSuperfluidFlow (provider, senderaddress, recipientAddress, flowRate) {
    
    const sf = new SuperfluidSDK.Framework({
      ethers: provider,
      tokens: tokenNames
    });
    await sf.initialize();
    const sfUser = sf.user({
      address: senderaddress,
      token: superTokenAddressMap['fDAI']
    });
  
    await sfUser.flow({
      recipient: recipientAddress,
      flowRate: flowRate
    });
    
    const details = await sfUser.details();
    console.log(details);
};

export async function stopSuperfluidFlow(provider , senderaddress, recipientAddress) {
    console.log(provider,senderaddress,recipientAddress)
    const sf = new SuperfluidSDK.Framework({
        ethers: provider,
        tokens: tokenNames
      });
      await sf.initialize();
      const sfUser = sf.user({
        address: senderaddress,
        token: superTokenAddressMap['fDAI']
      });
    
      await sfUser.flow({
        recipient: recipientAddress,
        flowRate: '0'
      });
      
      const details = await sfUser.details();
      console.log(details);
}