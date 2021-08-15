/* eslint-disable jsx-a11y/accessible-emoji */

import { Button, Card, Divider, Descriptions, Table, Tabs, Modal, Input } from "antd";
import React, { useState, useEffect, useCallback, useRef } from "react";
import "react-credit-cards/es/styles-compiled.css";
import GenericCard from "./GenericCard"


const { TabPane } = Tabs;

export default function PostUI({
  name,
  address,
  tx,
  provider,
  chainId,
  writeContracts,
  readContracts,
  ceramicIdx
}) {
  const [postItems, setPostItems] = useState([]);
  const fetchData = async () => {
    //////NFT Query/////////
    // on LOAD Query
    /////NFT Query/////////
    try{
      const oldNotes = (await ceramicIdx.get('notesList'))|| {notes:[]};
      let items = oldNotes.notes;
      for(let i=0; i<items.length; i++){
        items[i].key = i;
      }
      // console.log(items)
      setPostItems(items)
    } catch(err){
      console.log(" ERROR : ", err);
    }
};

useEffect(() => {
setTimeout(() => {

}, 2000);

fetchData()
},[ceramicIdx]);


  return(
    <div>
      <div  style={{ border: "1px solid #cccccc", padding: 16, width: 1200, margin: "auto", marginTop: 64, padding: 60 }}>
      <div className="market">
      {postItems && postItems.map((postItem) => (
                    <GenericCard
                    key={postItem.key}
                    name={postItem.name}  
                    description={postItem.description} 
                    imageURL={postItem.imageURL}
                    songURL={postItem.songURL}
                    />
                ))
                }
      </div>
       </div>
    </div>
  );
}