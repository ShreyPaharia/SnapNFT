/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { formatEther, parseEther, formatUnits, parseUnits } from "@ethersproject/units";
import {STORAGE_URL} from '../constants';
import { Button, Card, Divider, Descriptions, Table, Tabs, Modal, Input } from "antd";
import React, { useState, useEffect, useCallback, useRef } from "react";
import aggrementPdf from "./PaymentAggrement.pdf";
import { Document, Page } from "react-pdf";
import { log } from "util";
import Cards from "react-credit-cards";
import "react-credit-cards/es/styles-compiled.css";
import AnchorService from "../anchorServices/anchor.service";
const { chargeCardAPIWrap } = require("./../helpers/circleApi");


const { TabPane } = Tabs;

export default function AnchorUI({
  name,
  address,
  tx,
  provider,
  chainId,
  writeContracts,
  readContracts,
}) {
  const [transactions, setTransactions] = useState([]);
  const [displayTx, setDisplayTx] = useState([]);
  const [dataSrc, setDataSrc] = useState([]);
  const [visible, setVisible] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [recordKey, setRecordKey] = useState(null);
  const [recordKeyCC, setRecordKeyCC] = useState(null);
  const [showCCDetails, setShowCCDetails] = useState(false);
  const [nameCC, setNameCC] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [focus, setFocus] = useState("");

  const [ cardId , setCardId  ]= useState("");
  const [ amount , setAmount  ]= useState("");
  const [ month , setMonth  ]= useState("");
  const [ year , setYear  ]= useState("");
  const [ cardNumber , setCardNumber  ]= useState("");
  const [ line1 , setLine1  ]= useState("");
  const [ line2 , setLine2  ]= useState("");
  const [ city , setCity  ]= useState("");
  const [ district , setDistrict  ]= useState("");
  const [ postalCode, setPostalCode ]= useState("");
  const [ country , setCountry  ]= useState("");
  const [ phoneNumber , setPhoneNumber  ]= useState("");
  const [ email , setEmail  ]= useState("");
  const [ verification, setVerification ]= useState("");
  const [ type , setType  ]= useState("");
  const [ sessionId , setSessionId  ]= useState("");
  const [ ipAddress , setIpAddress  ]= useState("");
  const [ currency, setCurrency ]= useState("");

  const setExpiryMMYY = (e) => {
    if(e.target){
      setExpiry(e.target.value);
      setMonth(e.target.value.substring(0, 2));
      setYear(e.target.value.substring(3, 5))
    }
  }
  const prefillCCDetails =() => {
    setCardId("c49c359e-b763-435a-a103-b39f6bcdc76d")
    setAmount("100")
    setMonth("01")
    setYear("25")
    setExpiry("10/25");
    setCardNumber("5102420000000006")
    setCvv("345")
    setLine1("250 Greenwich St")
    setLine2("")
    setCity("New York")
    setDistrict("MA")
    setPostalCode("10006")
    setCountry("US")
    setNameCC("Joe Lee")
    setPhoneNumber("+12025550180")
    setEmail("customer-0005@circle.com")
    setVerification("cvv")
    setType("card")
    setSessionId("122")
    setIpAddress("172.33.222.1")
    setCurrency("USD")
  }
  const clearCCDetails =() => {
    setCardId("")
    setAmount("")
    setMonth("")
    setYear("")
    setExpiry("");
    setCardNumber("")
    setCvv("")
    setLine1("")
    setLine2("")
    setCity("")
    setDistrict("")
    setPostalCode("")
    setCountry("")
    setNameCC("")
    setPhoneNumber("")
    setEmail("")
    setVerification("")
    setType("")
    setSessionId("")
    setIpAddress("")
    setCurrency("")
  }
  const submitOnConfirmation = async() => {
    // if(recordKey){
      console.log(" Approving Transaction with Id", recordKey, writeContracts.CashflowTokens.address);
      // const transId = await tx(writeContracts.USDC.approve(writeContracts.CashflowTokens.address));
      const transId = await tx(writeContracts.MultiSigWallet.confirmTransaction(recordKey));
      console.log("transId", transId);
    // }
}

const onCCSubmit = async() => {
 const rowItem =  displayTx.filter(item=>item.key==recordKeyCC);
 const invoiceAmount =  rowItem && rowItem[0] && rowItem[0].InvoiceAmt && Number.parseFloat(rowItem[0].InvoiceAmt).toFixed(2);
    const payload = {
      cardId, amount: invoiceAmount, month, year,  cardNumber, cvv, line1, line2, city, district, postalCode,
      country, nameCC, phoneNumber, email, verification,
      type, sessionId, ipAddress, currency
    };
    console.log(" in onCCSubmit *************", recordKeyCC, displayTx, payload);
    const payResult = await chargeCardAPIWrap(payload);
      console.log(" Credit Card payResult  =========> ", payResult);
    const transId = await tx(writeContracts.CashflowTokens.repayCircle(Number.parseInt(recordKeyCC)+1));
    // console.log("transId", transId);
 setRecordKeyCC(null);
}

  const approvedHeader =     {
    title: 'Approve',
    key: 'operation',
    fixed: 'right',
    width: 100,
    render:(text, record) => <Button onClick={ async()=>{
      setRecordKey(record.key);
      setVisible(true);
    }} >Approve</Button>,
  }

  const deniedHeader = {
    title: 'Deny',
    key: 'operation2',
    fixed: 'right',
    width: 100,
    render:(text, record) => <><Button onClick={ async()=>{
      console.log(" Denying Transaction with Id", record.key);
      const transId = await tx(writeContracts.MultiSigWallet.rejectTransaction(record.key));
      console.log("transId", transId);

    }}>Deny</Button></>,
  }

  const repayHeader = {
    title: 'Repay',
    key: 'operation3',
    fixed: 'right',
    width: 100,
    render:(text, record) => <><Button onClick={ async()=>{
      const invAmt = transactions[record.key]["invoiceAmount"].toString();
      console.log(" invAmt ", invAmt);
      console.log(" Repay Transaction with Id", record.key+1, writeContracts.CashflowTokens.address, record.key,  invAmt);

      // let tokenMetaData = await tx(writeContracts.CashflowTokens.tokenMetaData(record.key));
      // console.log(" tokenMetaData  totalSupply ", tokenMetaData["totalSupply"].toNumber());
      // // console.log(" transactions ", transactions[record.Key]);
      // // let totalTokenSupply = tokenMetaData.totalSupply;

      // console.log("transId ", record.key);
      // console.log(" Repay Transaction with Id", recordKey, writeContracts.CashflowTokens.address);
      // console.log(" Approving Transaction with Id", recordKey, writeContracts.CashflowTokens.address, parseEther("" + transactions[recordKey]["invoiceAmount"]));
      const transId = await tx(writeContracts.USDC.approve(writeContracts.CashflowTokens.address, invAmt));
      console.log("transIds for approve", transId);
      const transId2 = await tx(writeContracts.CashflowTokens.repay(address, record.key+1));
      console.log("transIds for repay", transId, transId2);

    }}>Repay</Button></>,
  }

  const repayCircleHeader = {
    title: 'Repay in USD',
    key: 'operation4',
    fixed: 'right',
    width: 100,
    render:(text, record) => <><Button onClick={ async()=>{
      console.log(" Repay with circle ********",record.key);
      setRecordKeyCC(""+record.key);
      setShowCCDetails(true);
    }}>Repay in USD</Button></>,
  }

  const columns = [
    {
      title: 'Supplier',
      width: 100,
      dataIndex: 'Supplier',
      key: 'Supplier',
      fixed: 'left',
    },
    {
      title: 'Payment Date',
      width: 100,
      dataIndex: 'PaymentDate',
      key: 'PaymentDate',
      fixed: 'left',
    },
    {
      title: 'Invoice Amt',
      dataIndex: 'InvoiceAmt',
      key: 'InvoiceAmt',
      width: 150,
    },
    {
      title: 'Legal contract',
      dataIndex: 'Legalcontract',
      key: 'Legalcontract',
      width: 150,
      render:(text, record) => <a href={STORAGE_URL+ `${record.Legalcontract}`}  target="_blank">View Contract</a>,

    },
    {
      title: 'Invoice',
      dataIndex: 'Invoice',
      key: 'Invoice',
      width: 150,
      render:(text, record) => <a href={STORAGE_URL+`${record.Invoice}`}  target="_blank">View Invoice</a>,
    }
  ];



  const getMSTransactions = useCallback( async() => {
    const txs = await tx(readContracts.MultiSigWallet.getAllTransactions());
    console.log(" getMSTransactions ^^^^^^^^^^^^^", txs);
    setTransactions(txs);
  }, [readContracts, transactions]);

  useEffect(() => {
    if(readContracts && readContracts.MultiSigWallet){
      getMSTransactions();
    }
    return() => setTransactions([]);
  }, [readContracts])


  useEffect(() => {
    // const pendingTx = transactions.filter(item => item.status==0)
    console.log(" All transactions ", transactions);
    let supArr = [];
    let cnt =0;
    transactions && transactions.forEach( item => {
      let dt = item['paymentDate'].toNumber();
      let date = new Date(+dt);
      supArr.push({
        key: cnt,
        status: item["status"],
        transId: item[5].toNumber(),
        Supplier: item['supplier'].substr(0, 6),
        PaymentDate: date.toLocaleDateString("en-US"),
        InvoiceAmt: formatEther(item['invoiceAmount'].toString()),
        Legalcontract: item['legalContractHash'].substr(0, 6),
        Invoice: item['invoiceHash'],
      })
      cnt++;
    })
    console.log(" Pending transactions ", supArr);
    setDisplayTx(supArr)
    setTabCols(pendingTab);
    setDataSrc(supArr.filter(item=>item.status==0));

  }, [transactions])


  const pendingTab = [...columns];
  pendingTab.push(approvedHeader);
  pendingTab.push(deniedHeader);
  const rejectedTab = [...columns];
  const approvedTab = [...columns];
  approvedTab.push(repayHeader);
  approvedTab.push(repayCircleHeader);


  const [tabCols, setTabCols] = useState([]);
  // const [trxTable, setTrxTable] = useState((<Table
  //   columns={tabCols}
  //   dataSource={dataSrc}
  //   bordered
  //   title={() => 'Suppliers request'}
  //   footer={() => ''}
  // />));


        function callback(key) {
          console.log(key);
          switch(key){
            case "Pending":
              setTabCols(pendingTab);
              setDataSrc(displayTx.filter(item=>item.status==0));
              break;
            case "Rejected":
              setTabCols(rejectedTab);
              setDataSrc(displayTx.filter(item=>item.status==2));
              break;
            case "Approved":
              setTabCols(approvedTab);
              setDataSrc(displayTx.filter(item=>item.status==1));
              break;
          }
        }
    const tabList = ["Pending","Approved", "Rejected"];


  return(
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div  style={{ border: "1px solid #cccccc", padding: 16, width: 1200, margin: "auto", marginTop: 64, padding: 60 }}>
        <h1> </h1>

<Tabs defaultActiveKey="1" onChange={callback}>
  {tabList.map(tab=>{
    return(<TabPane tab={tab} key={tab}>
      <Table
      columns={tabCols}
      dataSource={dataSrc}
      bordered
      title={() => 'Suppliers request'}
      footer={() => ''}
    />
    </TabPane>)
  })}
  </Tabs>
          <Modal
              title="Payment Aggrement"
              centered
              visible={visible}
              onOk={() => { setVisible(false)
                          submitOnConfirmation();
                      }}
              onCancel={() => {setVisible(false);
                        setRecordKey(null);
                    }}
              okText="I Agree"

              width={1000}>
            <Document
              file={aggrementPdf}
              options={{ workerSrc: "/pdf.worker.js" }}
              onLoadSuccess={({ numPages })=>setNumPages(numPages)}>

              {Array.from(new Array(numPages),(el, index) =>(
                <Page key={`page_${index + 1}`} pageNumber={index + 1} />
              ))}
            </Document>
          </Modal>

          <Modal
              title="Pay with credit card"
              centered
              visible={showCCDetails}
              onOk={() => {
                setShowCCDetails(false);
                onCCSubmit();
                      }}
              onCancel={() => {
                setShowCCDetails(false);
                setRecordKeyCC(null);
                    }}
              okText = "Pay"
              footer={[
                <Button key="Clear" onClick={ async()=>{
                                    // setShowCCDetails(false);
                                    setRecordKeyCC(null);
                                    clearCCDetails();
                                      }}>Clear</Button>,
                <Button key="Prefill"
                onClick={ async()=>{
                                    // setShowCCDetails(false);
                                    prefillCCDetails();
                                    }}>Prefill</Button>,

                <Button key="PayNow" type="primary" onClick={ async()=>{
                                          setShowCCDetails(false);
                                          onCCSubmit();
                                              }}>
                  Pay Now
                </Button>
              ]}
              width={1000}>
 <Cards
        number={cardNumber}
        name={nameCC}
        expiry={expiry}
        cvv={cvv}
        focused={focus}
      />

        <div  style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 20, padding: 60 }}>
      <form>
        <Input
          type="tel"
          name="cardNumber"
          placeholder="Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          onFocus={(e) => setFocus(e.target.name)}
          // ref={ref}
        />
        <Input
          type="text"
          name="nameCC"
          placeholder="Name"
          value={nameCC}
          onChange={(e) => setNameCC(e.target.value)}
          onFocus={(e) => setFocus(e.target.name)}
        />
        <Input
          type="text"
          name="expiry"
          placeholder="MM/YY"
          value={expiry}
          onChange={(e) => {setExpiryMMYY(e)}}
          onFocus={(e) => setFocus(e.target.name)}
        />
        <Input
          type="tel"
          name="cvv"
          placeholder="cvv"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
          onFocus={(e) => setFocus(e.target.name)}
        />
      </form>
      </div>

          </Modal>

        <Divider />
        </div>
    </div>
  );
}