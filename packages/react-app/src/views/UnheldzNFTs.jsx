/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { formatEther, parseEther, formatUnits, parseUnits } from "@ethersproject/units";
import { Button, Card, Divider, Descriptions, Table, Tabs, Modal } from "antd";
import React, { useState, useEffect, useCallback } from "react";
import FilterBuyRentCard from "./FilterBuyRentCard"
import { startSuperfluidFlow, stopSuperfluidFlow} from "../helpers"

export default function UnheldzNFTs({
  name,
  address,
  tx,
  provider,
  chainId,
  userProvider,
  writeContracts,
  readContracts,
  zora
}) {

  const [unheldzNFTs, setUnheldzNFTs] = useState([]);
  const fetchData = async () => {
    try{
      ////Total NFTs owned
      
      console.log("********zora address ", address);
      let balance = (await zora.fetchTotalMedia()).toString();
      console.log("Zora Balance: ",balance);
      let tokenDataList = [];
      // balance = 2;
      // let tokenIds = [44,48]
      //All tokens of USER
      for(var i=0;i<balance;i++){

        ////Media id of NFT owned
        const mediaId = (await zora.fetchMediaByIndex(i)).toString();
        console.log("Media ",i," :",mediaId);

        /////TokenData
        const metadataURI = (await zora.fetchMetadataURI(mediaId));
        const contentURI = (await zora.fetchContentURI(mediaId));

        let tokenData = {
          mediaId:mediaId,
          contentURI  : contentURI,
          metadataURI : metadataURI
        }
        tokenDataList.push(tokenData);
        ////
      }
      // tokenDataList.map( async (item) => {
      let nftFilterArr = [];
      for(let i=0;i<tokenDataList.length; i++){
        let item  = tokenDataList[i];
        console.log("iteem ->", item);
        const metaJsonURL = (item.metadataURI && item.metadataURI.replace("https://ipfs://","https://ipfs.io/ipfs/")) || "";
        // const metaJson = await fetch(metaJsonURL);
        let metaData, metaJson;
        try{
          metaData = await (await fetch(metaJsonURL));
          if(!metaData) continue;
          metaJson = await metaData.json()

        }catch(e){
          console.log(e)
        }
        
        if(!metaJson || metaJson.type!="SNAP_NFT")continue;
        const curOwner = await zora.fetchOwnerOf(item.mediaId);
        if(curOwner == address) continue;

        const zoraAsk = await zora.fetchCurrentAsk(item.mediaId);
        let data = {
          id:item.mediaId,
          holder:curOwner,
          rentAsk:'1000000000000000',//zoraAsk,
          contentURI:(item.contentURI && item.contentURI.split("_")[0])||"",
          name:metaJson.name,
          description:metaJson.description,
          imageURL:(( metaJson.image && metaJson.image.replace("ipfs://","https://ipfs.io/ipfs/")) || "")
        }

        nftFilterArr.push(data);
        console.log("iteem2 ->", data);

        // nftFilterArr.push(item)
        }
      // });
      console.log("tokenDataList, ", nftFilterArr);
      setUnheldzNFTs(nftFilterArr);
      /////NFT Query/////////

      } catch(err){
        console.log(" ERROR : ", err);

      }
  };

  // useEffect(() => {
  //   setTimeout(() => {
  //   }, 2000);
  //   fetchData()
  // },[address, chainId]);

  const handleRentStart = async (recipient,amount) => {
    try{
      await startSuperfluidFlow(userProvider,address,recipient,amount);
    } catch(e){
      console.log(e);
    }
  }
  const handleRentStop = async (recipient) => {
    try {
      await stopSuperfluidFlow(userProvider,address,recipient)
    } catch(e){
      console.log(e);
    }
  }
  const handleZoraBid = async(mediaId,bid) => {
    try {
      zora.setBid(mediaId, bid)
    } catch (err){
      console.log(" ERROR  uploading", err);
    }
  }

  return(
    <div>
      <Button onClick={()=>fetchData()}>Refresh</Button>
      <div  style={{ border: "1px solid #cccccc", padding: 16, width: 1200, margin: "auto", marginTop: 64, padding: 60 }}>
      <div className="market">
      {unheldzNFTs && unheldzNFTs.map((unheldzNFTs) => (
                    <FilterBuyRentCard
                    key={unheldzNFTs.id}
                    nft={unheldzNFTs}
                    handleRentStart={handleRentStart}
                    handleRentStop={handleRentStop}
                    handleZoraBid={handleZoraBid}
                    />
                ))
                }
      </div>
       </div>
    </div>
  );
}