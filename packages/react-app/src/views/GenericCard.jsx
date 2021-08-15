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
                url: "https://creatornode.audius.co/tracks/stream/e4Ybn",//"https://tonejs.github.io/audio/berklee/gurgling_theremin_1.mp3",
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
              onOk={() => { 
                      }}
              onCancel={handleCancel}
              okText="Save"
              cancelText="Cancel"
              width={1000}>
                    <canvas width="800" height="800" id='genericCanvass'></canvas>

          </Modal>

        </div>
        )
}

export default GenericCard
