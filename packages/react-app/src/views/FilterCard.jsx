import React, { useState, createRef } from "react";
import { Card, Modal, Table } from "antd";
import { AppCanvas } from "../helpers"
import '../styles/CardAnt.css';
import { useHistory } from 'react-router-dom'
import { useScreenshot, createFileName } from "use-react-screenshot";
import { getIpfsHashByFile } from "./../textileHubUtil"
import {  STORAGE_URL } from "../constants";
import { SongsUI } from "./index";
// import { ExampleUI, Hints, Subgraph, SupplierUI, PostUI, LoginUI, RegisterUI, OtherNFTS, HomeUI, UnheldzNFTs } from "./views"

const { Meta } = Card;
function FilterCard({ nft, ceramicIdx}) {
    const { contentURI, imageURL, metadataURI } = nft;
    const { name, description } = metadataURI || {}
    const [visible, setVisible] = useState(false);
    const [ipfsHash, setIpfsHash] = useState("");
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
    // console.log("nft", nft);
    return (
        <div >
        <Card onClick={()=>setVisible(true)}
            hoverable
            style={{ width: 240 }}
            cover={<img alt="" src={imageURL} />}
        >
            <Meta title={name} description={description && description.length >= 100 ? description.substring(0, 100) + '...' : description} />
        </Card>
        <Modal
              title="Filter Preview"
              centered
              visible={visible}
              onOk={() => { setVisible(false);
                takeScreenShot(ref.current);
                downloadScreenshot();

              }}
              onCancel={() => {setVisible(false);
              }}
              okText="Save"
              cancelText="Cancel"
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
        </div>
        )
}

export default FilterCard
