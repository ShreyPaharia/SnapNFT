/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { formatEther, parseEther, formatUnits, parseUnits } from "@ethersproject/units";
import { Button, Card, Divider, Descriptions, Table, Tabs, Modal } from "antd";
import React, { useState, useEffect, useCallback } from "react";

export default function HistoryUI({
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
  const statusArr = ["Pending", "Approved", "Rejected"];

  const columns = [
    {
      title: 'Token #',
      width: 100,
      dataIndex: 'key',
      key: 'key',
      fixed: 'left',
    },
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
    },
    {
      title: 'Invoice',
      dataIndex: 'Invoice',
      key: 'Invoice',
      width: 150,
      render: (text, record) => <a href={`https://ipfs.io/ipfs/${record.Invoice}`}  target="_blank">view Invoice</a>,
    }
  ];


  const getMSTransactions = useCallback( async () => {
    const txs = await tx(readContracts.MultiSigWallet.getAllTransactions());
    console.log(" getMSTransactions ^^^^^^^^^^^^^", txs);
    setTransactions(txs);
  }, [readContracts, transactions]);

  useEffect( () => {
    if(readContracts && readContracts.MultiSigWallet){
      getMSTransactions();
    }
    return () => setTransactions([]);
  }, [readContracts])


  useEffect( () => {
    // const pendingTx = transactions.filter(item => item.status==0)
    console.log(" All transactions ", transactions);
    let supArr = [];
    let cnt =0;
    transactions.forEach( item => {
      let dt = item['paymentDate'].toNumber();
      let date = new Date(+dt);
      supArr.push({
        key: cnt,
        status: statusArr[item["status"]],
        transId: item[5].toNumber(),
        Supplier: item['supplier'].substr(0, 6),
        PaymentDate: date.toLocaleDateString("en-US"),
        InvoiceAmt: formatEther(item['invoiceAmount'].toString()),
        Legalcontract: item['legalContractHash'].substr(0, 6),
        Invoice: item['invoiceHash'],
      })
      cnt++;
    })
    setDisplayTx(supArr)

  }, [transactions])





  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div  style={{ border: "1px solid #cccccc", padding: 16, width: 1200, margin: "auto", marginTop: 64, padding: 60 }}>
        <h1> </h1>

      <Table
      columns={columns}
      dataSource={displayTx}
      bordered
      title={() => 'All transactions'}
      footer={() => ''}
    />

        <Divider />
        </div>
    </div>
  );
}
