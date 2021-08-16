import React, { useState, createRef } from "react";
import { Card, Modal, Button } from "antd";
import { AppCanvas } from "../helpers"
import '../styles/CardAnt.css';
import { useHistory } from 'react-router-dom'

const { Meta } = Card;
function FilterBuyRentCard({ nft, onOk, onCancel, name="", description="" }) {
    const { contentURI, imageURL, metadataURI } = nft;
    const [visible, setVisible] = useState(false);

    return (
        <div onClick={()=>setVisible(true)}>
        <Card
            hoverable
            style={{ width: 240 }}
            cover={<img alt="" src={imageURL} />}
        >
            <Meta title={name} description={description && description.length >= 100 ? description.substring(0, 100) + '...' : description} />
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
              onClick={async () => setVisible(true)}
          >
          Rent
          </Button> &nbsp;&nbsp;&nbsp;&nbsp;

        <Modal
              title="Filter Buy or Rent"
              centered
              visible={visible}
              onOk={ async() => { setVisible(false);
                onOk()
                // await startSuperfluidFlow(userProvider,address,"0x3aC9dD168e7Faf91211097E55116008Ce2c222f5",'10000000000000000')
              }}
              onCancel={ async () => {setVisible(false);
                onCancel();
                // await stopSuperfluidFlow(userProvider,address,"0x3aC9dD168e7Faf91211097E55116008Ce2c222f5")
              }}
              okText="Start Renting"
              cancelText="Stop Renting"
              width={1000}>
                  <AppCanvas filterSrc={`${contentURI}/filter.js`} rootPath={`${contentURI}`}></AppCanvas>
          </Modal>
        </div>
        )
}

export default FilterBuyRentCard
