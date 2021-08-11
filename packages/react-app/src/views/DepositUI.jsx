import { Card, Button, Table, Input } from "antd";
import React, { useMemo, useState, useCallback } from "react";
import { formatEther, parseEther, formatUnits, parseUnits } from "@ethersproject/units";

import { useContractExistsAtAddress, useContractLoader, useBalance } from "../hooks";
import Account from "../components/Account";
import { useEffect } from "react";
import {Graph} from "../helpers"
const axios = require('axios');


const noContractDisplay = (
  <div>
  </div>
);

const isQueryable = fn => (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;

export default function DepositUI({
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
  const [ amount, setAmount] = useState([]);
  const [ aaveRate, setAaveRate] = useState([]);

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
      title: 'Token Name',
      width: 100,
      dataIndex: 'key',
      key: 'key',
      fixed: 'left',
    },
    {
        title: 'Address',
        width: 100,
        dataIndex: 'address',
        key: 'address',
        fixed: 'left',
      },
    {
      title: 'Aave Rate',
      width: 100,
      dataIndex: 'aaveRate',
      key: 'aaveRate',
      fixed: 'left',
    },
    {
      title: 'Interest Rate',
      dataIndex: 'rate',
      key: 'rate',
      width: 150,
    },
    {
      title: 'Deposited',
      dataIndex: 'deposited',
      key: 'deposited',
      width: 150,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
    render: () => <Input addonBefore="$"
      placeholder="Amount"
      autoComplete="off"
      onChange={e => {
        setAmount(e.target.value);
          }}
        />
    },
    
    {
      title: 'Deposit',
      key: 'operation1',
      fixed: 'right',
      width: 100,
      render: (text, record) => <Button onClick={ async ()=>{
        const usdcMumbaiAddress = writeContracts.mumbaiUSDC.address;
        console.log(usdcMumbaiAddress);
        const transId = await tx(writeContracts.mumbaiUSDC.approve(writeContracts.LendingPoolDF.address, parseUnits(amount,6)));
        const transIdNew = await tx(writeContracts.LendingPoolDF.depositCollateral(usdcMumbaiAddress,parseUnits(amount,6),true));
        console.log(" Deposit Called for :",amount );
      }} >Deposit</Button>,
  },
    // {
    //     title: 'Redeem',
    //     key: 'operation1',
    //     fixed: 'right',
    //     width: 100,
    //     render: (text, record) => <Button onClick={ async ()=>{
    //       console.log(" Redeem for address", mmAddress, record.key, record);
    //       const transId = await tx(writeContracts.CashflowTokens.redeem(mmAddress, record.key));
    //       console.log("transId", transId);
    //       // await usdcToken.approve(cashflowTokens.address,tokens(totalTokenSupply.toString()),{from:anchor});
    //       // const transId2 = await tx(writeContracts.USDC.approve(writeContracts.CashflowTokens.address, record.BalanceAmt));
    //       // console.log("transId2", transId2);

    //       // setRecordKey(record.key);
    //       // setVisible(true);
    //     }} >Redeem</Button>,
    // },
    {
        title: 'Withdraw',
        key: 'operation2',
        fixed: 'right',
        width: 100,
        render: (text, record) => <Button onClick={ async ()=>{
          // cashflow token tranfer
          const transIdNew = await tx(writeContracts.LendingPoolDF.withdrawCollateral());

          // setRecordKey(record.key);
          // setVisible(true);
        }} >Withdraw</Button>,
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


  const displayLogs = async (contract) => {

    const getField = async (contract, field, ...params) => {
      console.log(contract.functions && contract.functions[field] && await contract.functions[field](...params));

    }
    let balance =  null;
      // if()
        try{
          const tempArr = [];
          let totalCFToken = 0;

            const graphOut = await Graph(api,query);
            const liquidityRate = graphOut.data.reserves[0].liquidityRate;
            console.log("Liquidity Rate:", liquidityRate)

            const aRate= liquidityRate/(10**25)
            console.log("Aave Rate %:",aRate)
            tempArr.push({
                key:"USDC",
                address:contracts.USDC.address,
                aaveRate:aRate.toFixed(4),
                rate:(aRate+1).toFixed(4),
                deposited:"100",
            })
          setAaveRate(aRate);
          setCfTrans(tempArr);
          setTotalCFAmt(totalCFToken);

        } catch(err){
          console.log(" ERROR ", err);
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
  const api = "https://api.thegraph.com/subgraphs/name/aave/protocol-v2";
  const query = `
query {
  reserves (where:{symbol:"USDC"}){
    symbol
    name
  	underlyingAsset
    liquidityRate
  }
  
}

  `
   const cashFlowTable =  <Table
                            columns={columns}
                            dataSource={cfTrans}
                            bordered
                            title={() => ''}
                            // footer={() => `Grand Total ${totalCFAmt}`}
                          />;
    // const usdcComp  = ({usdBalance}<div>);

  return (
    <div style={{ margin: "auto", width: "70vw" }}>
      <Card
        title={
          <div>
            {"Pools"}
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
        {contractIsDeployed ? contractDisplay : noContractDisplay}
        { name=="CashflowTokens" && cashFlowTable}
        {/* { name=="USDC" && usdBalance} */}

      </Card>
    </div>
  );
}
