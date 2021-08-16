import React, { useState, createRef } from "react";
import { Card, Modal, Table } from "antd";
import { AppCanvas } from "../helpers"

// import { Icon } from '@iconify/react';
// import ethereumIcon from '@iconify-icons/mdi/ethereum';
import '../styles/CardAnt.css';
import { useHistory } from 'react-router-dom'
import { useScreenshot, createFileName } from "use-react-screenshot";
const { Meta } = Card;
function FilterCard({ nft }) {
    const { contentURI, imageURL, metadataURI } = nft;
    const { name, description } = metadataURI
    const [visible, setVisible] = useState(false);
    const ref = createRef(null);
    const [image, takeScreenShot] = useScreenshot({
      type: "image/jpeg",
      quality: 1.0
    });
  
    const download = (image, { name = "img", extension = "jpg" } = {}) => {
      const a = document.createElement("a");
      a.href = image;
      a.download = createFileName(extension, name);
      a.click();
    };
  
    const downloadScreenshot = () => takeScreenShot(ref.current).then(download);
  
  
    // console.log("nft", nft);
    
    return (
        <div onClick={()=>setVisible(true)}>
        <Card
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
