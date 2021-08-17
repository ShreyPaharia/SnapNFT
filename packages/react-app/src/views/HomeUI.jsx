import { Card, Button, Table } from "antd";
import React, { useMemo, useState, useEffect, createRef } from "react";
import { formatEther, parseEther } from "@ethersproject/units";
import { useContractExistsAtAddress, useContractLoader, useBalance } from "../hooks";
import Account from "../components/Account";
import FilterCard from "./FilterCard"
import '../styles/CardAnt.css';


export default function HomeUI({
  customContract,
  account,
  gasPrice,
  signer,
  provider,
  name,
  show,
  price,
  blockExplorer,
  chainId,
  tx,
  writeContracts,
  readContracts,
  address,
  zora,
  ceramicIdx,
}) {

  const [ filterNFT, setFilterNFT] = useState([]);
  // const [ filterNFT, setFilterNFT] = useState([]);
  // const [ filterNFT, setFilterNFT] = useState([]);

              const fetchData = async () => {
                //////NFT Query/////////
                try{
                ////Total NFTs owned
                console.log("********zora address ", address);
                let balance = (await zora.fetchBalanceOf(address)).toString();
                console.log("Zora Balance: ",balance);
                let tokenDataList = [];

                //All tokens of USER
                // balance=2
                // let mediaList = [44,48]
                for(var i=0;i<balance;i++){

                  ////Media id of NFT owned
                  const mediaId = (await zora.fetchMediaOfOwnerByIndex(address,i)).toString();
                  // const mediaId = mediaList[i]
                  console.log("Media ",i," :",mediaId);
                  // if(){
                  //   zora.burn()
                  // }

                  /////TokenData
                  const contentHash = (await zora.fetchContentHash(mediaId));
                  const metadataHash = (await zora.fetchMetadataHash(mediaId));
                  const contentURI = (await zora.fetchContentURI(mediaId));
                  const metadataURI = (await zora.fetchMetadataURI(mediaId));

                  const tokenData = {
                    contentHash : contentHash,
                    metadataHash: metadataHash,
                    contentURI  : contentURI,
                    metadataURI : metadataURI
                  }
                  tokenDataList.push(tokenData);
                  ////
                }
                // tokenDataList.map( async (item) => {
                const nftFilterArr = [];
                console.log("tokenDataList, ", tokenDataList);

                for(let i=0;i<tokenDataList.length; i++){
                    const item  = tokenDataList[i];
                  // console.log("iteem ->", item);
                  const metaJsonURL = (item.metadataURI && item.metadataURI.replace("https://ipfs://","https://ipfs.io/ipfs/")) || "";
                  // const metaJson = await fetch(metaJsonURL);
                  // const metaJson = await (await fetch(metaJsonURL)).json();
                  let metaJson = {};
                  try {
                    const metaJsonStr = await fetch(metaJsonURL);
                    metaJson = await (metaJsonStr).json();
                    } catch(err){
                      console.log("Error ", err);
                    }

                  item.contentURI=(item.contentURI && item.contentURI.split("_")[0])||"";
                  item.metadataURI=metaJson;
                  item.imageURL = (( metaJson.image && metaJson.image.replace("ipfs://","https://ipfs.io/ipfs/")) || "");
                  // return item;
                  // tokenDataList[i] = item;
                  // setFilterNFT(tokenDataList);
                  console.log("item ->",i, item);
                  nftFilterArr.push(item)
                  }
                // });
                console.log("nftFilterArr, ", nftFilterArr);
                setFilterNFT(nftFilterArr);
                /////NFT Query/////////

                } catch(err){
                  console.log(" ERROR : ", err);

                }
        };

    useEffect(() => {
      setTimeout(() => {

      }, 2000);

      if(address){
        fetchData()
      }
  },[address]);


  return (
    <div  style={{ border: "1px solid #cccccc", padding: 16, width: 1000, margin: "auto", marginTop: 64, padding: 60 }}>
      <div className="market">
      {filterNFT && filterNFT.map((nft) => (
                    <FilterCard
                    key={nft.contentHash}
                    nft={nft}
                    ceramicIdx={ceramicIdx}
                    />
                ))
                }
      </div>
        </div>
  );
}
