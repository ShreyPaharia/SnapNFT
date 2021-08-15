import { Card, Button, Table } from "antd";
import React, { useMemo, useState, useEffect, createRef } from "react";
import { formatEther, parseEther } from "@ethersproject/units";
import { useContractExistsAtAddress, useContractLoader, useBalance } from "../hooks";
import Account from "../components/Account";
import FilterCard from "./FilterCard"
import '../styles/Card.css';

const axios = require('axios');


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
}) {

  const [ filterNFT, setFilterNFT] = useState([]);
  // const [ filterNFT, setFilterNFT] = useState([]);
  // const [ filterNFT, setFilterNFT] = useState([]);

              const fetchData = async () => {
                //////NFT Query/////////
                try{
                ////Total NFTs owned
                console.log("********zora address ", address);
                const balance = (await zora.fetchBalanceOf(address)).toString();
                console.log("Zora Balance: ",balance);
                let tokenDataList = [];

                //All tokens of USER
                for(var i=0;i<balance;i++){

                  ////Media id of NFT owned
                  const mediaId = (await zora.fetchMediaOfOwnerByIndex(address,i)).toString();
                  console.log("Media ",i," :",mediaId);

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
                for(let i=0;i<tokenDataList.length; i++){
                    const item  = tokenDataList[i];
                  console.log("iteem ->", item);
                  const metaJsonURL = (item.metadataURI && item.metadataURI.replace("https://ipfs://","https://ipfs.io/ipfs/")) || "";
                  // const metaJson = await fetch(metaJsonURL);
                  const metaJson = await (await fetch(metaJsonURL)).json();

                  item.contentURI=(item.contentURI && item.contentURI.split("_")[0])||"";
                  item.metadataURI=metaJson;
                  item.imageURL = (( metaJson.image && metaJson.image.replace("ipfs://","https://ipfs.io/ipfs/")) || "");
                  // console.log("iteem2 ->", item);
                  // return item;
                  tokenDataList[i] = item;
                  // nftFilterArr.push(item)
                  }
                // });
                setFilterNFT(tokenDataList);
                console.log("tokenDataList, ", tokenDataList);
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
                    />
                ))
                }
      </div>
        </div>
  );
}
