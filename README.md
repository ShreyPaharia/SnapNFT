<p align="center"><img src="/Logo.PNG" align="center" width="400"></p>
 
<p  align="center">An AR Filter NFT Marketplace! 🚀</p>
 
## Motivation
 
- It stemmed from the idea of selling code using NFTs. What if people could build websites in a decentralised manner? Here every feature could be built and sold by anyone as an NFT, which can be purchased to use it. To build a proof of concept of this we decided to build AR Filters on NFT.
 
## Solution
- We are building a decentralised solution to create and sell AR Filters as NFTs. People can use these AR Filters to take pictures and videos and post it directly on our platform.
- This is handled using a new type of NFTs which we are calling execNFTs, wherein creators can mint their code as an NFT which can be integrated with any website. 
- On minting a new AR Filter NFT, files are stored onto decentralised storage along with the NFT metadata. Then they can add an ask to the NFT or start an NFT auction. People can buy these NFTs to use these novel AR Filters. Users can also click pictures and post it directly on the platform which are stored in their own buckets. Optionally they can also add music to these posts.
 
## Future Work
- We want to extend this platform to integrate with Instagram and Snapchat creator studios, so that artists can use those Filters on these platforms and monetize their work.
- We want to improve the UI/UX of the application to streamline the process even further.
- We want to work on an SDK which can be used to integrate using execNFTs on any website. And make the minting process more generic to handle various use cases of website features as NFTs. Some examples of this can be a generic website of productivity apps, where people can build their own applications and mint them as NFTs which can then be bought to use the developed features.
 
## Implementation
 
![image](https://github.com/ShreyPaharia/SnapNFT/blob/master/Flow.png)
 
## Various blockchain protocol integrations 
 
### Protocol Labs (NFT.Storage)
 
- We are using NFT.Storage to store the NFT metadata during the minting process. Since they have inbuilt checks for proper metadata usage and ensure that the data persists forever using filecoin.
 
### Zora
 
- Using Zora contracts to mint zNFTs. We set the store contentHash and metadataHash. Also, we set the ask by the creator for anyone to buy this NFT on the platform.
  
### Textile
 
- Using textile to store all the required files including png, javascript, json etc. These files are encrypted and the user can change these files to update the NFT.
  
### Chainlink
 
- Used for getting price feed for eth/usd and matic/usd to interconvert values between more than two assets allowing to pay invoice in several currencies.
  
### Covalent
 
- Using to get NFT data from the chain and address input by the user. Which can be used on the platform as a filter.
 
### Audius
 
- Using to choose from the trending songs on audius and add it to the user post. When looking at these posts, these songs are fetched using stream API and played along with the posts.
 
### Ceramic
- Used to store the user posts data using idx service. This data can be used easily by multiple platforms to build better interfaces for the posts generated on SnapNFT. 
  
### Polygon
- The chainlink contract and the NFT data is all deployed on Polygon Mumbai Testnet. 
 
### Unlock
- Have added a subscription lock for some features on our site. 
- [Payment Link](https://app.unlock-protocol.com/checkout?redirectUri=http://localhost:3000/supplierui&paywallConfig=%7B%22locks%22%3A%7B%220x7f075931f5b7c9b69663090315b70f56a8f80487%22%3A%7B%22network%22%3A4%7D%7D%2C%22persistentCheckout%22%3Atrue%2C%22icon%22%3A%22https%3A%2F%2Flocksmith.unlock-protocol.com%2Flock%2F0x7f075931f5b7c9b69663090315b70f56a8f80487%2Ficon%22%7D)
 
## Polygon Deployments (Mumbai)
- Chainlink Price Consumer: [0x429EFa36ff406aA9DCAE57A1488dE2097ABb1556](https://mumbai.polygonscan.com/address/0x429EFa36ff406aA9DCAE57A1488dE2097ABb1556)
 
## Rinkeby Deployments
- Chainlink Price Consumer: [0xA9dEd60aA6a4d4fE96f32F917d0cB1BfEDA5d962](https://rinkeby.etherscan.io/address/0xA9dEd60aA6a4d4fE96f32F917d0cB1BfEDA5d962)
- Unlock Contract: [0x7f075931f5b7c9b69663090315b70f56a8f80487](https://rinkeby.etherscan.io/address/0x7f075931f5b7c9b69663090315b70f56a8f80487)