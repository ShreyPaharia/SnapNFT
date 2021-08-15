import React, { useState } from "react";
import { Card, Modal, Table } from "antd";
import { AppCanvas } from "../helpers"

// import { Icon } from '@iconify/react';
// import ethereumIcon from '@iconify-icons/mdi/ethereum';
import '../styles/CardAnt.css';
import { useHistory } from 'react-router-dom'
const { Meta } = Card;
function GenericCard({ name,  description, imageURL, callBack}) {
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
              title={name}
              centered
              visible={visible}
              onOk={() => { 
                      }}
              onCancel={() =>{
                setVisible(false)
            } }
              okText="Save"
              cancelText="Cancel"
              width={1000}>
                    <canvas width="800" height="800" id='genericCanvass'></canvas>

          </Modal>

        </div>
        )
}

export default GenericCard
