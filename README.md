<p align="center"><img src="/Logo.PNG" align="center" width="400"></p>

<p  align="center">An AR Filter NFT Marketplace! 🚀</p>

## Motivation
    It stemmed from the idea of selling code using NFTs. What if people could build websites in a decentralised manner? Here every feature could be built and sold by anyone as an NFT, which can be purchased to use it. To build a proof of concept of this we decided to build AR Filters on NFT.

## Solution
    We are building a decetralised solution to create and sell AR Filters as NFTs. People can use these AR Filters to take pictures and videos and post it directly on our platform. 
    On minting a new AR Filter NFT, files are stored onto decentralised storage along with the NFT metadata. Then they can add an ask to the NFT or start an NFT auction. People can buy these NFTs to use these novel AR Filters. Users can also click pictures and post it directly on the platform which are stored in their own buckets.

## Implementation

![image](https://github.com/ShreyPaharia/DeepFinV1/blob/v1_ethodyssey/Flow.png)

## Various blockchain protocol integrations 

### Protocol Labs (NFT.Storage)

- We are using NFT.Storage to store the NFT metadata during the minting process. Since they have inbuilt checks for proper metadata usage and ensure that the data persists forever using filecoin.

### Zora

- Using Zora contracts on Polygon Mumbai testnet to mint zNFTs.
  
### Textile

- Using textile to store the all the required files including png, javascript, json etc. These files are encrypted and the user can change these files to update the NFT.
  
### Chainlink

- Used for getting price feed for eth/usd and matic/usd to interconvert values between more than two assets allowing to pay invoice in several currencies.
  
### Covalent

- Using to get NFT data from the chain and address input by the user. Which can be used on the platform as a filter.

### Audius

- Using to choose from the trending songs on audius and add it to user post. When looking at these posts, these songs are fetched using stream API and played along with the posts.

### Ceramic
- Used to store the user posts data using idx service. This data can be used easily by multiple platforms to build better interfaces for the posts generated on SnapNFT. 
  
### Polygon
- The chainlink contract and the NFT data is all deployed on Polygon Mumbai Testnet. 

## Polygon Deployments (Mumbai)

- (coming soon)

