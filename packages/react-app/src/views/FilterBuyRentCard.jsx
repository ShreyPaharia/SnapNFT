import React, { useState, createRef } from "react";
import { Input, Card, Modal, Button } from "antd";
import { AppCanvas } from "../helpers"
import '../styles/CardAnt.css';
import { useScreenshot, createFileName } from "use-react-screenshot";
import { getIpfsHashByFile } from "../textileHubUtil"
import {  STORAGE_URL } from "../constants";
import { SongsUI } from "./index";

const { Meta } = Card;
function FilterBuyRentCard({ nft, handleRentStart,handleRentStop,handleZoraBid, onOk, onCancel, name="", description="" }) {
    const { contentURI, imageURL, metadataURI } = nft;
    const [visibleRent, setvisibleRent] = useState(false);
    const [visibleBuy, setvisibleBuy] = useState(false);
    const [ipfsHash, setIpfsHash] = useState("");
    const [bidPrice, setBidPrice] = useState("");
    const [selectedSong, setSelectedSong] = useState("");
    const ref = createRef(null);
    const [image, takeScreenShot] = useScreenshot({
      type: "image/jpeg",
      quality: 1.0
    });
    const addToCeramic = async (ceramicIdx, ipfsHash, audiusHash) =>{
      try {
        console.log("addToCeramic ipfsHash", ipfsHash);

        const oldNotes = (await ceramicIdx.get('notesList'))|| {notes:[]};
        await ceramicIdx.set('notesList', {
          notes: [
            ...(oldNotes.notes),
            { name:`screenShot from ${name}`, description:`screenShot desc: ${description}`, imageURL:STORAGE_URL+`${ipfsHash}`, songURL:audiusHash?`https://creatornode.audius.co/tracks/stream/${audiusHash}`:""},
          ]
        })

        const xyz = await ceramicIdx.get('notesList');
        console.log("new notesList after Add ",xyz);

      } catch (err){
        console.log(" ERROR  Playing", err);
      }
    }
    const downloadSnap = async (image, { extension = "jpg" } = {}) => {
      const fileName = `screenShot from ${name}`;
      const fileNameExt = createFileName(extension, fileName);
      const a = document.createElement("a");
      a.href = image;
      a.download = fileNameExt;
      a.click();
      const ipfsHash1 = await getIpfsHashByFile(image, fileNameExt, setIpfsHash)
      addToCeramic(ipfsHash1)
    };
    const downloadScreenshot = () => takeScreenShot(ref.current).then(downloadSnap);

    return (
        <div >
        <Card
            hoverable
            style={{ width: 240 }}
            cover={<img alt="" src={imageURL} />}
        >
            <Meta title={nft.name} description={nft.description && nft.description.length >= 100 ? nft.description.substring(0, 100) + '...' : nft.description} />
        </Card>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Button 
              onClick={async () => {
            try {
              setvisibleBuy(true);
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
                setvisibleRent(true)
              }}
          >
          Rent
          </Button> &nbsp;&nbsp;&nbsp;&nbsp;

        <Modal
              title="Rent"
              centered
              visible={visibleRent}
              onOk={ async() => { setvisibleRent(false);
                takeScreenShot(ref.current);
                downloadScreenshot();
                await handleRentStop(nft.holder)
              }}
              onCancel={ async () => {
                setvisibleRent(false);
                await handleRentStop(nft.holder)
              }}
              okText="Post"
              cancelText="Stop Rental"
              width={1000}>
             <SongsUI setSelectedSong={setSelectedSong}></SongsUI>

                <div  ref={ref}         style={{
                                      border: "1px solid #ccc",
                                      padding: "10px",
                                      marginTop: "20px"
                                    }}>
                  <AppCanvas filterSrc={`${contentURI}/filter.js`} rootPath={`${contentURI}`}></AppCanvas>
                </div>
          </Modal>
          <Modal
              title="Buy"
              centered
              visible={visibleBuy}
              onOk={ async() => {
                handleZoraBid(nft.id, bidPrice);
                setvisibleBuy(false);
              }}
              onCancel={ async () => {
                setvisibleBuy(false);
              }}
              okText="Confirm"
              cancelText="cancel"
              width={1000}>
                  <Input addonBefore="$"
                    placeholder="Enter the bid price"
                    autoComplete="off"
                    onChange={e => {
                      setBidPrice(e.target.value);
                    }}
                    />

          </Modal>
        </div>
        )
}

export default FilterBuyRentCard
