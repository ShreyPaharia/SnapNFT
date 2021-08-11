import { Card, Button, Table } from "antd";
import React, { useMemo, useState, useCallback } from "react";
import { formatEther, parseEther } from "@ethersproject/units";
import { useContractExistsAtAddress, useContractLoader, useBalance } from "../hooks";
import Account from "../components/Account";
import { useEffect } from "react";
const axios = require('axios');

const noContractDisplay = (
  <div>
  </div>
);

const isQueryable = fn => (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;

export default function HomeUI({
  customContract,
  account,
  mmAddress,
  gasPrice,
  signer,
  provider,
  name,
  show,
  price,
  blockExplorer,
  chainId,
  tx,
  writeContracts,
  readContracts,
}) {

  const [ cfTrans, setCfTrans] = useState([]);
  const [ totalCFAmt, setTotalCFAmt] = useState([]);
  const [ usdBalance, setUsdBalance] = useState([]);
  const contracts = useContractLoader(provider, { chainId });
  let contract;
  if (!customContract) {
    contract = contracts ? contracts[name] : "";
  } else {
    contract = customContract;
  }


  const address = contract ? contract.address : "";
  const contractIsDeployed = useContractExistsAtAddress(provider, address);

  // const getBal = async (contract, address) => {
  // }

  const accBalance = useBalance(provider, address);


  const columns = [
    {
      title: 'Token Number',
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
      title: 'Balance Amt',
      dataIndex: 'BalanceAmt',
      key: 'BalanceAmt',
      width: 150,
    },
    {
      title: 'Repaid',
      dataIndex: 'isRepaid',
      key: 'isRepaid',
      width: 150,
    },
    {
      title: 'Borrow',
      key: 'operation1',
      fixed: 'right',
      width: 100,
      render: (text, record) => <Button onClick={ async ()=>{
        console.log(" Borrow Called");
      }} >Borrow</Button>,
  },
    {
        title: 'Redeem',
        key: 'operation1',
        fixed: 'right',
        width: 100,
        render: (text, record) => <Button onClick={ async ()=>{
          console.log(" Redeem for address", mmAddress, record.key, record);
          const transId = await tx(writeContracts.CashflowTokens.redeem(mmAddress, record.key));
          console.log("transId", transId);
          // await usdcToken.approve(cashflowTokens.address,tokens(totalTokenSupply.toString()),{from:anchor});
          // const transId2 = await tx(writeContracts.USDC.approve(writeContracts.CashflowTokens.address, record.BalanceAmt));
          // console.log("transId2", transId2);

          // setRecordKey(record.key);
          // setVisible(true);
        }} >Redeem</Button>,
    },
    {
        title: 'Transfer',
        key: 'operation2',
        fixed: 'right',
        width: 100,
        render: (text, record) => <Button onClick={ async ()=>{
          console.log(" Transfer ", record);
          // cashflow token tranfer

          // setRecordKey(record.key);
          // setVisible(true);
        }} >Transfer</Button>,
      }
  ];

  // const logTokens = async ( cToken )=> {

  //   var lastTokenId = await cToken.methods.lastTokenId().call();
  //   let uri = await cToken.methods.uri(lastTokenId).call();

  //   var tokenList = []

  //   for (var tokenId=1 ;tokenId<=lastTokenId; tokenId++){
  //     var tokenBalanceDict = {}
  //     var balance = await cToken.methods.balanceOf(account,tokenId).call();
  //     if(balance>0){
  //       let tokenUri = uri.replace("{id}",tokenId);

  //       await axios.get(tokenUri).then((res)=>{
  //         tokenBalanceDict["tokenId"] = tokenId;
  //         // tokenBalanceDict["balance"] = this.toEtherFromWei(balance);
  //         tokenBalanceDict["details"] = res.data;
  //         tokenList.push(tokenBalanceDict);
  //       }).catch((res)=>console.log(res))
  //     }
  //   }

  //   console.log("------Token Log Starts-----")
  //   console.log("Total Tokens: "+(lastTokenId))
  //   console.log("Total Token Balances:-");
  //   console.log(tokenList)
  //   this.setState({ loading: false })
  // }

  // string public name = "Cashflow Tokens";
  // string public symbol = "cToken";
  // uint256 public lastTokenId;
  // USDC public usdcToken;
  // address public owner;
  // mapping (uint256 => uint256) public totalSupply;
  // mapping (uint256 => bool) public isRepaid;
  // mapping (uint256 => TokenMetaData) public tokenMetaData;
  const displayLogs = async (contract) => {

    const getField = async (contract, field, ...params) => {
      console.log(contract.functions && contract.functions[field] && await contract.functions[field](...params));

    }
    let balance =  null;
    if(name == "CashflowTokens"){
      // if()
        try{
          const result = await contract.getAllTransactions();
          // console.log("*******mmAddress",mmAddress)
          // console.log("*********account", account)
          const resultBal = await contract.getAllBalances(mmAddress);
          const resultBalEther = resultBal.map(x=>formatEther(x.toString()));

          // console.log(" *********result ", result);
          // console.log(" *********result balance", resultBalEther)
          const tempArr = [];
          let totalCFToken = 0;
          result.forEach( (item, idx) => {
            // if(!item['isRepaid'] && item['totalSupply'].toNumber()>0){
              if(idx!=0 && resultBalEther[idx]>0){
              // totalCFToken+=formatEther(['totalSupply'].toString());
              // console.log("******repaid => "+item['isRepaid'])
              tempArr.push({
                key: idx,
                Supplier: item['supplier'].substr(0, 6),
                status: item["status"],
                BalanceAmt: resultBalEther[idx],
                isRepaid: item['isRepaid']?"Yes":"No",
              })
            }
            // }
          })
          setCfTrans(tempArr);
          setTotalCFAmt(totalCFToken);

        } catch(err){
          console.log(" ERROR ", err);
        }
    } else if ( name =="USDC"){
          const res = contract.balanceOf && await contract.balanceOf(address)
          setUsdBalance(res && res.toNumber());
          console.log(" USDC Total ", res && res.toNumber());
    }
  }

  useEffect(()=>{
    displayLogs(contract);

  }, [contract,mmAddress])
  // if(contract.balanceOfBatch){

  // }

  const displayedContractFunctions = useMemo(
    () =>
      contract
        ? Object.values(contract.interface.functions).filter(
            fn => fn.type === "function" && !(show && show.indexOf(fn.name) < 0),
          )
        : [],
    [contract, show],
  );

  // const refresh = useCallback(async () => {
  //   try {
  //     const funcResponse = await contract[fn.name]();
  //     console.log("funcResponse", funcResponse);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }, []);

  const mintCToken = async () => {
    if(name == "CashflowTokens"){
      console.log(" !!!!!!!!!!!!!!!contract ", name, contract);
    }
  }

  // const [refreshRequired, triggerRefresh] = useState(false);
  const contractDisplay = ""
  // const contractDisplay = displayedContractFunctions.map(fn => {
  //   if (isQueryable(fn)) {
  //     // If there are no inputs, just display return value
  //     return (
  //       <DisplayVariable
  //         key={fn.name}
  //         contractFunction={contract[fn.name]}
  //         functionInfo={fn}
  //         refreshRequired={refreshRequired}
  //         triggerRefresh={triggerRefresh}
  //       />
  //     );
  //   }
  //   // If there are inputs, display a form to allow users to provide these
  //   return (
  //     <></>
  //     // <FunctionForm
  //     //   key={"FF" + fn.name}
  //     //   contractFunction={
  //     //     fn.stateMutability === "view" || fn.stateMutability === "pure"
  //     //       ? contract[fn.name]
  //     //       : contract.connect(signer)[fn.name]
  //     //   }
  //     //   functionInfo={fn}
  //     //   provider={provider}
  //     //   gasPrice={gasPrice}
  //     //   triggerRefresh={triggerRefresh}
  //     // />
  //   );
  // });
   const cashFlowTable =  <Table
                            columns={columns}
                            dataSource={cfTrans}
                            bordered
                            title={() => ''}
                            footer={() => `Grand Total ${totalCFAmt}`}
                          />;
    // const usdcComp  = ({usdBalance}<div>);

  return (
    <div style={{ margin: "auto", width: "70vw" }}>
      <Card
        title={
          <div>
            {name}
            <div style={{ float: "right" }}>
              <Account
                address={address}
                localProvider={provider}
                injectedProvider={provider}
                mainnetProvider={provider}
                price={price}
                blockExplorer={blockExplorer}
              />
              {account}
            </div>
          </div>
        }
        size="large"
        style={{ marginTop: 25, width: "100%" }}
        loading={contractDisplay && contractDisplay.length <= 0}
      >
        {/* {contractIsDeployed ? contractDisplay : noContractDisplay}
        { name=="CashflowTokens" && cashFlowTable} */}
        {/* { name=="USDC" && usdBalance} */}

      </Card>
    </div>
  );
}
