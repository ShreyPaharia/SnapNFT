import React, { useState } from "react";
import { Card, Modal, Table } from "antd";
import { AppCanvas } from "../helpers"

// import { Icon } from '@iconify/react';
// import ethereumIcon from '@iconify-icons/mdi/ethereum';
import '../styles/CardAnt.css';
import { useHistory } from 'react-router-dom'
const { Meta } = Card;
function FilterCard({ nft }) {
    const { contentURI, imageURL, metadataURI } = nft;
    const { name, description } = metadataURI
    const [visible, setVisible] = useState(false);

    return (
        <div onClick={()=>setVisible(true)}>
        <Card
            hoverable
            style={{ width: 240 }}
            cover={<img alt="" src={imageURL} />}
        >
            <Meta title={name} description={description} />
        </Card>
        <Modal
              title="Filter Preview"
              centered
              visible={visible}
              onOk={() => { setVisible(false)
                        //   submitOnConfirmation();
                        // getImage()
                      }}
              onCancel={() => setVisible(false)}
              okText="Save"
              // cancelText="Ciao"
              width={1000}>
                <AppCanvas filterSrc={`${contentURI}/filter.js`} rootPath={`${contentURI}`}></AppCanvas>
          </Modal>
        </div>
        )
}

export default FilterCard
