import React, { useState, createRef } from "react";
import { Card, Modal, Button } from "antd";
import { AppCanvas } from "../helpers"
import '../styles/CardAnt.css';
import { useHistory } from 'react-router-dom'

const { Meta } = Card;
function FilterBuyRentCard({ nft, handleRentStart,handleRentStop,handleZoraBid, onOk, onCancel, name="", description="" }) {
    const { contentURI, imageURL, metadataURI } = nft;
    const [visible, setVisible] = useState(false);

    console.log(imageURL);
    return (
        <div >
        <Card
            hoverable
            style={{ width: 240 }}
            cover={<img alt="" src={imageURL} />}
        >
            <Meta title={nft.name} description={nft.description && nft.description.length >= 100 ? nft.description.substring(0, 100) + '...' : nft.description} />
        </Card>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Button 
              onClick={async () => {
            try {
                // await stopSuperfluidFlow(userProvider,address,"0x3aC9dD168e7Faf91211097E55116008Ce2c222f5")
            } catch (err){
              console.log(" ERROR  uploading", err);
            }
          }}>
          Buy
          </Button> &nbsp;&nbsp;&nbsp;&nbsp;
          <Button 
              onClick={async () => {
                await handleRentStart(nft.holder,nft.rentAsk)
                setVisible(true)
              }}
          >
          Rent
          </Button> &nbsp;&nbsp;&nbsp;&nbsp;

        <Modal
              title="Filter Buy or Rent"
              centered
              visible={visible}
              onOk={ async() => { setVisible(false);
                onOk()
              }}
              onCancel={ async () => {
                setVisible(false);
                await handleRentStop(nft.holder)
              }}
              okText="Post"
              cancelText="Stop Rental"
              width={1000}>
                  <AppCanvas filterSrc={`${contentURI}/filter.js`} rootPath={`${contentURI}`}></AppCanvas>
          </Modal>
        </div>
        )
}

export default FilterBuyRentCard
