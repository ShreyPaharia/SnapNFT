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


import { STORAGE, STORAGE_URL, TEXTILE_HUB_BUCKET_NAME } from "../constants";


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
  generateMetadata
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

  const [anchors, setAnchors] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [filters, setFilters] = useState([]);
  const [filterSrc, setFilterSrc] = useState("");
  // const [address, setAddress] = useState([]);
  const [signer, setSigner] = useState(null);
  const [hubId, setHubId] = useState(null);
  const [bucketObj, setBucketObj] = useState(null);
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

  // useEffect(async () => {
  //   // await getBucketKey()
  //   connecTotHub();
  //   }, []);


//   useEffect( async () => {
//   AnchorService.getAnchorList().then( res => {
//     console.log("AnchorService.getAnchorList ", res);
//     setAnchors(res.data)
//     setAnchorList(res.data)
//   })
// }, [])

const submitOnConfirmation = async () => {

  console.log("anchor ", anchor);

  const anchorS = anchorList && anchorList.find(item => item.value === anchor);
  const selectedAnchor = anchorS && anchorS.key;

  console.log(" supplier contract values  ", address, paymentDate, selectedAnchor, parseEther("" +amount), ipfsHash, writeContracts);
  console.log("***selectedAnchor", selectedAnchor);
  console.log("MultiSigWallet ", writeContracts.MultiSigWallet);

  // let supplier = await tx(writeContracts.MultiSigWallet.suppliers(0));
  // console.log(" supplier ", supplier);

  // const supplier = await writeContracts.MultiSigWallet.suppliers(0);
  // if(!supplier) {
  //   console.log(" Adding supplier");
  //   supplier = await tx(writeContracts.MultiSigWallet.addSupplier(address));
  //   const checkSupplier = await tx(writeContracts.MultiSigWallet.suppliers());
  //   console.log(" added supplier ", supplier, checkSupplier);
  //   console.log(" added supplier ", supplier);
  // }
  // if(supplier){
    console.log(writeContracts);
    const transId = await tx(writeContracts.MultiSigWallet.submitTransaction(ipfsHash, ipfsHash, selectedAnchor, parseEther("" +amount), paymentDate));
    console.log("transId", transId);
    // const newTrx = await tx(readContracts.MultiSigWallet.getConfirmationCount(transId.hash));
    // console.log(" newTrx ", newTrx);
  // }

}

const anchorMenus = (
    <Menu onClick={e => {
      // console.log(" in anchorMenu", e);
      const newSelected = anchors && anchors.find(item => item.key === e.key);
      console.log("newSelected", newSelected && newSelected.key);
      setAnchor(newSelected && newSelected.value);
    }}>
      {anchors && anchors.map(item => (
        <Menu.Item key={item.key}  icon={<UserOutlined />}>{item.value}</Menu.Item>
      ))}
    </Menu>
  );
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
        {/* { if(ipfsHash) { */}
            <img src={STORAGE_URL+`${ipfsHash}`} alt="" align="middle"/>
          {/* }
        } */}
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
            // e.preventDefault()
          //  try {
          //   await connecTotHub();
          //   // const textHubId = createIdentity(signer, address);
          //   const bucket = await getOrCreateBucket(TEXTILE_HUB_BUCKET_NAME, signer, address);
          //   console.log(" ********* bucket ", bucket);
          //  } catch (err){
          //    console.log(" ERROR ", err);
             
          //  }  
            
            // console.log(" ****** upload event ", e);
            // const file = e.fileList[0] && e.fileList[0].originFileObj;
            // const reader = new window.FileReader()
            // reader.readAsArrayBuffer(file)
            // reader.onloadend = async () => {
            //   const buff = Buffer(reader.result);
            //   setBuffer(buff);
            //   // console.log('buffer', buff);
            //   if(STORAGE==="IPFS"){
            //     Ipfs.files.add(buff, (error, result) => {
            //       if(error) {
            //         console.error(error)
            //         return
            //       }
            //       console.log(" ipfs Hash ", result[0] && result[0].hash);
            //       setIpfsHash(result[0] && result[0].hash);
            //     })
            //   } else if (STORAGE=="FILECOIN"){
            //     const response = await Slate(file)
            //     if(response.decorator!=="V1_UPLOAD_TO_SLATE"){
            //       console.log("ERROR IN UPLOAD",response);
            //     } else {
            //       setIpfsHash(response && response.data.cid);
            //       console.log("UPLOAD DONE:    ", response)
            //     }
                
            //   }
            // }
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
        <Button  type="primary"
            onClick={async () => {
              const bucketO = await connecTotHub();
              const links = await logLinks(bucketO.buckets, bucketO.bucketKey);
              const src = links.url+"/"+localStorage.getItem("path");
              setFilterSrc(src)

   
              // const price = await tx(readContracts.PriceConsumerV3.ethPrice());
              // setEthPrice(price);



              // //////NFT Query/////////

              // ////Total NFTs owned
              // const balance = (await zora.fetchBalanceOf(address)).toString();
              // console.log("Zora Balance: ",balance);
              // let tokenDataList = [];

              // ////All tokens of USER
              // for(var i=0;i<balance;i++){

              //   ////Media id of NFT owned
              //   const mediaId = (await zora.fetchMediaOfOwnerByIndex(address,i)).toString();
              //   console.log("Media ",i," :",mediaId);

              //   /////TokenData
              //   const contentHash = (await zora.fetchContentHash(mediaId));
              //   const metadataHash = (await zora.fetchMetadataHash(mediaId));
              //   const contentURI = (await zora.fetchContentURI(mediaId));
              //   const metadataURI = (await zora.fetchMetadataURI(mediaId));


              //   const tokenData = {
              //     contentHash : contentHash,
              //     metadataHash: metadataHash,
              //     contentURI  : contentURI,
              //     metadataURI : metadataURI
              //   }
              //   tokenDataList.push(tokenData);
              //   ////
              // }

              // console.log(tokenDataList);

              // ///////NFT Query/////////




              ////NFT Minting///////
              // const metadataJSON = generateMetadata('zora-20210101', {
              //   description: '',
              //   mimeType: 'text/plain',
              //   name: '',
              //   version: 'zora-20210101',
              // })

              // const metaData = await uploadNFTStorage({
              //   name:'Token', //Required
              //   version:'1',
              //   description:'TokenAsset', //Required
              //   image: new File([/* data */], 'pinpie.jpg', { type: 'image/jpg' }) //Required - Can be used for LOGO

              // })
              // console.log(metaData)
              
              // const metaDataUrlUpdated = 'https://'+metaData.url;
              // const contentHash = sha256FromBuffer(Buffer.from('Ours123 Truly,'))
              // const metadataHash = sha256FromBuffer(Buffer.from(metaDataUrlUpdated))
              // const mediaData = constructMediaData(
              //   'https://ipfs.io/ipfs/bafybeifyqibqlheu7ij7fwdex4y2pw2wo7eaw2z6lec5zhbxu3cvxul6h4',
              //   metaDataUrlUpdated,
              //   contentHash,
              //   metadataHash
              // )

              // const bidShares = constructBidShares(
              //   10, // creator share
              //   90, // owner share
              //   0 // prevOwner share
              // )
              // const tx = await zora.mint(mediaData, bidShares)
              // await tx.wait(8) // 8 confirmations to finalize

              // console.log("zNFT Minted:",tx)
              //////NFT Minting/////////
              
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