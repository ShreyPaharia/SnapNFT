import React, { useState } from "react";
import { Card, Modal, Table } from "antd";
import { AppCanvas } from "../helpers"
import * as Tone from 'tone'

// import { Icon } from '@iconify/react';
// import ethereumIcon from '@iconify-icons/mdi/ethereum';
import '../styles/CardAnt.css';
import { useHistory } from 'react-router-dom'
const { Meta } = Card;
function GenericCard({ name,  description, imageURL,songURL,callBack}) {
    const [visible, setVisible] = useState(false);
    const [audiusPlayer, setAudiusPlayer] = useState(null);

    const handleCancel = () => {
        if(audiusPlayer!=null) {
            audiusPlayer.stop();
        }
        setVisible(false);
      };
    const handleClick = () => {
        if(songURL){
            const player = new Tone.Player({
                url: songURL,
                // loop: true,
                autostart: true,
              }).toDestination();
              setAudiusPlayer(player);
        }
        setVisible(true);
    }
    return (
        <div >
        <Card
            hoverable
            style={{ width: 240 }}
            cover={<img alt="" src={imageURL}
            onClick={handleClick} />}
        >
            <Meta title={name} description={description} />
        </Card>
        <Modal
              title={name}
              centered
              visible={visible}
              onOk={handleCancel}
              onCancel={handleCancel}
              okText="Ok"
              cancelText="Cancel"
              width={1000}>
                <img src={imageURL} width="800" height="800"></img>

          </Modal>

        </div>
        )
}

export default GenericCard
