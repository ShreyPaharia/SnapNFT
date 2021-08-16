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
}) {

  const [unheldzNFTs, setUnheldzNFTs] = useState([]);
  const fetchData = async () => {
    //////NFT Query/////////
    // on LOAD 
       /////NFT Query/////////
    try{
      // let metaJsonURL = "https://api.covalenthq.com/v1/"+chainId+"/address/"+address+"/balances_v2/?nft=true&key=ckey_c1c10fb1097b4e32b396e101878";
      let metaJsonURL= "https://api.covalenthq.com/v1/80001/address/0x64bdCD3513388D93431F7D4ff429553bb173D0b2/balances_v2/?nft=true&key=ckey_c1c10fb1097b4e32b396e101878";
      let json = await (await fetch(metaJsonURL)).json() 
      let tokens = json.data.items.filter(item=> item.type=="nft" && item.nft_data!=null);
      let data = []
      console.log(tokens);

      tokens.forEach(token => {
          token.nft_data.forEach(nft => {
            data.push({
              name:nft.external_data.name,
              description:nft.external_data.description,
              imageURL:nft.external_data.image,
            })
        })
      })
      console.log(data);

      setUnheldzNFTs(data);
    } catch(err){
      console.log(" ERROR : ", err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
    }, 2000);
    fetchData()
  },[address, chainId]);

  const onOk = async () => await stopSuperfluidFlow(userProvider,address,"0x3aC9dD168e7Faf91211097E55116008Ce2c222f5")
  const onCancel = async () => await startSuperfluidFlow(userProvider,address,"0x3aC9dD168e7Faf91211097E55116008Ce2c222f5",'10000000000000000');


  return(
    <div>
      <div  style={{ border: "1px solid #cccccc", padding: 16, width: 1200, margin: "auto", marginTop: 64, padding: 60 }}>
      <div className="market">
      {unheldzNFTs && unheldzNFTs.map((unheldzNFTs) => (
                    <FilterBuyRentCard
                    key={unheldzNFTs.id}
                    nft={unheldzNFTs}
                    onOk={onOk}
                    onCancel={onCancel}
                    />
                ))
                }
      </div>
       </div>
    </div>
  );
}