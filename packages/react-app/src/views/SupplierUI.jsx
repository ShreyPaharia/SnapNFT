/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { formatEther, parseEther } from "@ethersproject/units";
import { Card, Button, Modal, DatePicker, Divider, Input, Popconfirm, Progress, Slider, Spin, Switch, AutoComplete, Space, Select, Radio, Form, Menu, Dropdown, Upload } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, DownOutlined, UploadOutlined, InboxOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from "react";
import {Ipfs, Slate, AppCanvas, uploadNFTStorage} from "../helpers"
import { getIdentity, getOrCreateBucket, pushAllFile, getFilters, pushAllFile2, pullFile, logLinks} from "./../textileHubUtil"
import { getBucketKey } from "./../textileHubUtill2"
import AnchorService from "../anchorServices/anchor.service";
import { Document, Page } from "react-pdf";
import aggrementPdf from "./PaymentAggrement.pdf";
import { useUserAddress } from "eth-hooks";
import * as Tone from 'tone'



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
  const [ipfsHash, setIpfsHash] = useState("");
  const [hubBucket, setHubBucket] = useState("");
  const [buffer, setBuffer] = useState();
  const [visible, setVisible] = useState(false);
  const [numberTokens, setNumberTokens] = useState(null);
  const [percentageToCreator, setPercentageToCreator] = useState("");
  const [allowLiveStream, setAllowLiveStream] = useState("");
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
        const metadataJSON = generateMetadata('zora-20210101', {
          description: '',
          mimeType: 'text/plain',
          name: filterName || '',
          version: 'zora-20210101',
        })

        const imageUrl = STORAGE_URL+`${ipfsHash}`;
        const imgData = await fetch(imageUrl);
        const imgBlob = await imgData.blob();

        const metaData = await uploadNFTStorage({
          name: title || filterName || '',
          version:'1',
          description: description || '',
          image: new File([imgBlob], 'nftLogo.jpg', { type: 'image/jpg' }) //Required - Can be used for LOGO

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
          // numberTokens,
          // percentageToCreator,
          // allowLiveStream
          )
        console.log(" mediaData ", mediaData);

        const bidShares = constructBidShares(
          parseInt(percentageToCreator), // creator share
          100 - parseInt(percentageToCreator), // owner share
          // 10, // creator share
          // 90, // owner share
          0 // prevOwner share
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
        {
            ipfsHash? <img src={STORAGE_URL+`${ipfsHash}`} alt="" align="middle" width="300" height="300"/> :<></>
        }
        <Upload.Dragger name="logo_files" action="/upload.do"
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

        <Upload name="directory" action="/upload.do"
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

      <Input addonBefore="#"
        placeholder="Number of tokens"
        autoComplete="off"
        onChange={e => {
          setNumberTokens(e.target && e.target.value);
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

          <Switch checkedChildren="Allowed for Live Stream" unCheckedChildren="Live Stream not allowed" defaultChecked       onChange={e => {
        setAllowLiveStream(e.target && e.target.value);
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
          <Button 
          onClick={async () => {
            try {
              const bucketO = await connecTotHub();
              await logLinks(bucketO.buckets, bucketO.bucketKey);
              // console.log(" files to bucketObj ", bucketO);
              console.log(" localStorage.getItem(path) ->", localStorage.getItem("path"));
              
              const filterArr = await pullFile(bucketO.buckets, bucketO.bucketKey, localStorage.getItem("path"));
              console.log(" filterArr ", filterArr);
              setFilters(filterArr);
            } catch (err){
              console.log(" ERROR  uploading", err);

            }
          
          }}
          >
          Show Filters
          </Button> &nbsp;&nbsp;&nbsp;&nbsp;
          <Button 
          onClick={async () => {
            try {
              if(audiusPlayer!=null) {
                audiusPlayer.stop()
              }
              const player = new Tone.Player({
                url: "https://creatornode.audius.co/tracks/stream/e4Ybn",//"https://tonejs.github.io/audio/berklee/gurgling_theremin_1.mp3",
                // loop: true,
                autostart: true,
              }).toDestination();
              setAudiusPlayer(player);
              // Tone.loaded().then(() => {
              //   player.start();
              // });

            } catch (err){
              console.log(" ERROR  Playing", err);

            }
          
          }}
          >
          Test Tone
          </Button> &nbsp;&nbsp;&nbsp;&nbsp;
          <Button 
          onClick={async () => {
            try {

              const oldNotes = await ceramicIdx.get('notesList');
              await ceramicIdx.set('notesList', {
                notes: [
                  ...(oldNotes.notes),
                  {title:"Post",description:"Post Desc",mediaUrl:"https://fdf5.com",songUrl:"https://audius.com/abcd"},
                ]
              })

              // await idx.set('basicProfile', {
              //   name: 'Alan Turing',
              //   description: 'I make computers beep good.',
              //   emoji: '💻',
              // })
              const xyz = await ceramicIdx.get('notesList');
              console.log("notesList",xyz);

            } catch (err){
              console.log(" ERROR  Playing", err);

            }
          
          }}
          >
          Test Ceramic Add
          </Button> &nbsp;&nbsp;&nbsp;&nbsp;
        <Button  type="primary"
            onClick={async () => {
              const bucketO = await connecTotHub();
              const links = await logLinks(bucketO.buckets, bucketO.bucketKey);
              const src = links.url+"/"+localStorage.getItem("path");
              setFilterSrc(src)

   
              // const price = await tx(readContracts.PriceConsumerV3.ethPrice());
              // setEthPrice(price);







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
                <AppCanvas filterSrc={`${filterSrc}/filter.js`} rootPath={`${filterSrc}`}></AppCanvas>
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
  );
}
