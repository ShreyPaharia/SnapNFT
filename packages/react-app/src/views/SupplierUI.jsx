/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { formatEther, parseEther } from "@ethersproject/units";
import { Card, Button, Modal, DatePicker, Divider, Input, Popconfirm, Progress, Slider, Spin, Switch, AutoComplete, Space, Select, Radio, Form, Menu, Dropdown, Upload } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, DownOutlined, UploadOutlined, InboxOutlined } from '@ant-design/icons';
import React, { useState, createRef, useEffect } from "react";
import {Ipfs, Slate, AppCanvas, uploadNFTStorage, startSuperfluidFlow, stopSuperfluidFlow} from "../helpers"
import { getIdentity, getOrCreateBucket, pushAllFile, getFilters, pushAllFile2, pullFile, logLinks} from "./../textileHubUtil"
import { getBucketKey } from "./../textileHubUtill2"
import AnchorService from "../anchorServices/anchor.service";
import { Document, Page } from "react-pdf";
import aggrementPdf from "./PaymentAggrement.pdf";
import { useUserAddress } from "eth-hooks";
import * as Tone from 'tone'
// import { useScreenshot } from 'use-react-screenshot'
import FilterCard from "./FilterCard";
import '../styles/CreateNFT.css'
import GenericCard from "./GenericCard"
import { SongsUI } from "./index";



import { STORAGE, STORAGE_URL, TEXTILE_HUB_BUCKET_NAME } from "../constants";
const { TextArea } = Input;


export default function SupplierUI({
  name,
  address,
  tx,
  provider,
  chainId,
  writeContracts,
  readContracts,
  cashflowContract,
  setCashflowEvents,
  MultisigWalletContract,
  useContractLoader,
  customContract,
  setMultisigWalletContract,
  zora,
  constructBidShares,
  constructMediaData,
  sha256FromBuffer,
  userProvider,
  generateMetadata,
  ceramicIdx
}) {

  let contracts;



  const [anchorList, setAnchorList] = useState("Select Anchor from the list");
  const [paymentDateStr, setPaymentDateStr] = useState("");
  const [paymentDate, setPaymentDate] = useState(0);
  const [anchor, setAnchor] = useState("Select Anchor from the list");
  const [amount, setAmount] = useState("");
  const [ethPrice, setEthPrice] = useState("");
  const [maticPrice, setMaticPrice] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [hubBucket, setHubBucket] = useState("");
  const [buffer, setBuffer] = useState();
  const [visible, setVisible] = useState(false);
  const [percentageToPrevOwner, setPercentageToPrevOwner] = useState(null);
  const [percentageToCreator, setPercentageToCreator] = useState("");
  const [walletTo, setWalletTo] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState([]);
  const [filters, setFilters] = useState([]);
  const [filterSrc, setFilterSrc] = useState("");
  // const [address, setAddress] = useState([]);
  const [signer, setSigner] = useState(null);
  const [hubId, setHubId] = useState(null);
  const [bucketObj, setBucketObj] = useState(null);
  const [audiusPlayer, setAudiusPlayer] = useState(null);
  // const [image, takeScreenShot] = useScreenshot();
  const ref = createRef(null);
  // const getImage = () => takeScreenShot(ref.current);


  const fetchCLPrice = async () =>{
    try{
      if(readContracts){
        let priceEthRaw = (await tx(readContracts.PriceConsumerV3.ethPrice())).toString();
        let priceMaticRaw = (await tx(readContracts.PriceConsumerV3.maticPrice())).toString();
        priceEthRaw = priceEthRaw/10**8
        priceMaticRaw = priceMaticRaw/10**8

        console.log("Prices: ", priceEthRaw, priceMaticRaw)
        setEthPrice(priceEthRaw);
        setMaticPrice(priceMaticRaw);
      }
    } catch(e){
      console.log(e);
    }

  }
  useEffect(() => {
    setTimeout(() => {
    
    }, 2000);
    
    fetchCLPrice()
    },[readContracts]);
    
  const connecTotHub = async () => {
    try {
      let signer1;
      if(!hubId){
        signer1 = userProvider.getSigner();
        const hubId = await getIdentity(signer1, address);
        setHubId(hubId);
        setSigner(signer1);
      }
        const buckets = await getOrCreateBucket(TEXTILE_HUB_BUCKET_NAME, signer1, address);
        setBucketObj(buckets);
        console.log(" ********* bucket ", buckets);
        return buckets;
       } catch (err){
         console.log(" ERROR ", err);
         
       }  

    }


    function getRandomIntInclusive(min=1, max=1000) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
    }

  const mintNFT = async () => {

    try{
          const filterName = localStorage.getItem('path');
          //NFT Minting///////
        // const metadataJSON = generateMetadata('zora-20210101', {
        //   description: '',
        //   mimeType: 'text/plain',
        //   name: filterName || '',
        //   version: 'zora-20210101',
        // })

        const imageUrl = STORAGE_URL+`${ipfsHash}`;
        const imgData = await fetch(imageUrl);
        const imgBlob = await imgData.blob();

        const metaData = await uploadNFTStorage({
          name: title || filterName || '',
          version:'1',
          description: description || '',
          image: new File([imgBlob], 'nftLogo.jpg', { type: 'image/jpg' }), //Required - Can be used for LOGO
          type: 'SNAP_NFT'
        })
        console.log("metaData", metaData)

        const bucketO = await connecTotHub();
        const links = await logLinks(bucketO.buckets, bucketO.bucketKey);
        const contentUrl = `${links.url}/${filterName}_${getRandomIntInclusive()}`;
        console.log("*************** contentUrl ", contentUrl)
        const metaDataUrlUpdated = 'https://'+metaData.url;
        const contentHash = sha256FromBuffer(Buffer.from(contentUrl))
        const metadataHash = sha256FromBuffer(Buffer.from(metaDataUrlUpdated))
        const mediaData = constructMediaData(
          contentUrl,
          // 'https://ipfs.io/ipfs/bafybeifyqibqlheu7ij7fwdex4y2pw2wo7eaw2z6lec5zhbxu3cvxul6h4',
          metaDataUrlUpdated,
          contentHash,
          metadataHash
          // ,
          // amount,
          // percentageToCreator,
          )
        console.log(" mediaData ", mediaData);

        const bidShares = constructBidShares(
          parseInt(percentageToCreator), // creator share
          100 - parseInt(percentageToCreator) - parseInt(percentageToPrevOwner), // owner share
          // 10, // creator share
          // 90, // owner share
          parseInt(percentageToPrevOwner) // prevOwner share
        )
        const tx = await zora.mint(mediaData, bidShares)
        // zora.setAsk(media, amt)
        await tx.wait(8) // 8 confirmations to finalize

        console.log("zNFT Minted:",tx)
        ////NFT Minting/////////

    }catch( err){
      console.log(" ERROR ", err);

    }
  }

const submitOnConfirmation = async () => {
    mintNFT();

}

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div  style={{ border: "1px solid #cccccc", padding: 16, width: 1000, margin: "auto", marginTop: 64, padding: 60 }}>
      <div className="create">

          <div className="card__infoValue" >
          <GenericCard
                    key={getRandomIntInclusive}
                    name={title}  
                    description={description} 
                    imageURL={STORAGE_URL+`${ipfsHash}`}
                    /> 
          <Card size="small" title="Current Prices" style={{ width: 200, height:150 }}>
          <p>Price in Eth: {amount && (amount/ethPrice).toFixed(2)}</p>
          <p>Price in Matic: {amount && (amount/maticPrice).toFixed(2)}</p>
        </Card>        
        </div>
          <div className="create__details">
          <h1> Create your own filter</h1>
        <Divider />
        <div align="left" style={{ margin: 8 }}>
        <div style={{ margin: '24px 0' }} />
        <div >
        </div>

        <div style={{ margin: '24px 0'}} />
        <Input placeholder="Title" allowClear 
                onChange={e => {
                  setTitle(e.target && e.target.value);
                }}
         />

        <div style={{ margin: '24px 0'}} />
        <TextArea placeholder="Description" allowClear 
                onChange={e => {
                  setDescription(e.target && e.target.value);
                }}
         />

        <div style={{ margin: '24px 0'}} />

        <Upload.Dragger name="logo_files"
          onChange={ async (e) => {
            // e.preventDefault()
            console.log(" upload event ", e);
            const logoFile = e.fileList[0] && e.fileList[0].originFileObj;
            const logoReader = new window.FileReader()
            logoReader.readAsArrayBuffer(logoFile)
            logoReader.onloadend = async () => {
              const buff = Buffer(logoReader.result);
              setBuffer(buff);
              console.log('buffer', buff);
              if(STORAGE==="IPFS"){
                Ipfs.files.add(buff, (error, result) => {
                  if(error) {
                    console.error(error)
                    return
                  }
                  console.log(" ipfs Hash ", result[0] && result[0].hash);
                  setIpfsHash(result[0] && result[0].hash);
                })
              } else if (STORAGE=="FILECOIN"){
                const response = await Slate(logoFile)
                if(response.decorator!=="V1_UPLOAD_TO_SLATE"){
                  console.log("ERROR IN UPLOAD",response);
                } else {
                  setIpfsHash(response && response.data.cid);
                  console.log("UPLOAD DONE:    ", response)
                }

              }
            }
        }}
        >
        <p className="ant-upload-drag-icon">
            <InboxOutlined />
        </p>
        <p className="ant-upload-text">Logo Upload</p>
        <p className="ant-upload-hint">Click or drag file to this area to upload the Logo</p>
        <p className="ant-upload-hint">Support for a single or bulk upload.</p>
        </Upload.Dragger>


        <div style={{ margin: '24px 0' }} />

        <Upload name="directory" showUploadList="false"
          onChange={ async (e) => {
            setFileList(e && e.fileList);
        }}
        directory>
          <Button icon={<UploadOutlined />}>Upload Directory</Button>
        </Upload>

        <div style={{ margin: '24px 0' }} />

          <Input addonBefore="$"
            placeholder="Amount"
            autoComplete="off"
            onChange={e => {
              setAmount(e.target.value);
            }}
          />
        <div style={{ margin: '24px 0' }} />

        <Input addonBefore="%"
          placeholder="Percentage to creator"
          autoComplete="off"
          onChange={e => {
            setPercentageToCreator(e.target && e.target.value);
          }}
        />
    <div style={{ margin: '24px 0' }} />

    <Input addonBefore="%"
      placeholder="Percentage to previous owner"
      autoComplete="off"
      onChange={e => {
        setPercentageToPrevOwner(e.target && e.target.value);
      }}
    />

        {/* </Input.Group> */}
        </div>
        <Divider />
        <Button 
          onClick={async () => {
            try {
              const path = fileList[0] && fileList[0].originFileObj.webkitRelativePath;
              const  filterName = path && path.substr(0, path.indexOf("/"));
              localStorage.setItem("path", filterName||"");

              console.log(" files to upload ", fileList);
              const bucketO = await connecTotHub();
              await logLinks(bucketO.buckets, bucketO.bucketKey);
              console.log(" files to bucketObj ", bucketO);
              await pushAllFile2(fileList, bucketO.buckets, bucketO.bucketKey);
              const links = await logLinks(bucketO.buckets, bucketO.bucketKey);
              setHubBucket(links);


            } catch (err){
              console.log(" ERROR  uploading", err);

            }
          
          }}
          >
          Upload
          </Button> &nbsp;&nbsp;&nbsp;&nbsp;

          {/* <Button 
          onClick={async () => {
            try {
                await startSuperfluidFlow(userProvider,address,"0x3aC9dD168e7Faf91211097E55116008Ce2c222f5",'10000000000000000')
            } catch (err){
              console.log(" ERROR  uploading", err);

            }
          
          }}
          >
          Test Start Flow
          </Button> &nbsp;&nbsp;&nbsp;&nbsp;

          <Button 
          onClick={async () => {
            try {
                await stopSuperfluidFlow(userProvider,address,"0x3aC9dD168e7Faf91211097E55116008Ce2c222f5")
            } catch (err){
              console.log(" ERROR  uploading", err);

            }
          
          }}
          >
          Test Stop Flow
          </Button> &nbsp;&nbsp;&nbsp;&nbsp; */}
        <Button  type="primary"
            onClick={async () => {

              const bucketO = await connecTotHub();
              const links = await logLinks(bucketO.buckets, bucketO.bucketKey);
              const src = links.url+"/"+localStorage.getItem("path");
              setFilterSrc(src)

   
          






              setVisible(true);
            }}
          >
            Preview
          </Button>
          <Modal
              title="Filter Preview"
              centered
              visible={visible}
              onOk={() => { setVisible(false)
                          submitOnConfirmation();
                      }}
              onCancel={() => setVisible(false)}
              okText="Submit"
              // cancelText="Ciao"
              width={1000}>
                <AppCanvas filterSrc={`${filterSrc}/filter.js`} rootPath={`${filterSrc}`} ></AppCanvas>
                {/* {STORAGE_URL+`${ipfsHash}`} */}
            {/* <Document
              file={aggrementPdf}
              options={{ workerSrc: "/pdf.worker.js" }}
              onLoadSuccess={({ numPages })=>setNumPages(numPages)}>

              {Array.from(new Array(numPages), (el, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} />
              ))}
            </Document> */}

            {/* <Card title="Invoice Amount" bordered={false} style={{ width: 300 }}>
              <p>$ {amount}</p>
              <p>ETH {amount/ethPrice}</p>

            </Card> */}
          </Modal>
        <Divider />
{/* 
        <Input addonBefore=""
            placeholder="Wallet Description"
            autoComplete="off"
            onChange={e => {
              setWalletDesc(e.target && e.target.value);
            }}
          />

        <Button
            onClick={async () => {
              const result = await AnchorService.createtWalletAPI(walletDesc);
              console.log(" created wallet ",result);

            }}
          > */}
            {/* Create Wallet
          </Button>
          <Input addonBefore=""
            placeholder="Wallet from"
            autoComplete="off"
            onChange={e => {
              setWalletFrom(e.target && e.target.value);
            }}
          />
        <Input addonBefore=""
            placeholder="Wallet to"
            autoComplete="off"
            onChange={e => {
              setWalletTo(e.target && e.target.value);
            }}
          />
          <Button
            onClick={async () => {
              const result = await AnchorService.transferAPI(walletFrom, walletTo, 1);
              console.log(" created wallet ",result);

            }}
          >
            Transfer Wallet
          </Button> */}
        </div>
        </div>
        </div>
    </div>
  );
}
