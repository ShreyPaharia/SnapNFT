/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { formatEther, parseEther, formatUnits, parseUnits } from "@ethersproject/units";
import { Button, Card, Divider, Descriptions, Table, Tabs, Modal } from "antd";
import React, { useState, useEffect, useCallback } from "react";
import GenericCard from "./GenericCard"

export default function OtherNFTS({
  name,
  address,
  tx,
  provider,
  chainId,
  writeContracts,
  readContracts,
}) {

  const [otherNfts, setotherNfts] = useState([]);
  const fetchData = async () => {
    //////NFT Query/////////
    // on LOAD Query
    /////NFT Query/////////
    try{

      setotherNfts([])
    } catch(err){
      console.log(" ERROR : ", err);
    }
};

useEffect(() => {
setTimeout(() => {

}, 2000);

fetchData()
},[]);


  return(
    <div>
      <div  style={{ border: "1px solid #cccccc", padding: 16, width: 1200, margin: "auto", marginTop: 64, padding: 60 }}>
      <div className="market">
      {otherNfts && otherNfts.map((otherNft) => (
                    <GenericCard
                    key={otherNft.id}
                    otherNft={otherNft}
                    />
                ))
                }
      </div>
       </div>
    </div>
  );
}