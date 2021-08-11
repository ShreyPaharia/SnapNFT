/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { formatEther, parseEther } from "@ethersproject/units";
import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { Address, Balance } from "../components";

export default function ExampleUI({
  purpose,
  address,
  mainnetProvider,
  tx,
  writeContracts,
}) {
  // const [newPurpose, setNewPurpose] = useState("loading...");
  const [newUsdc, setNewUsdc] = useState("loading...");

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h4>Enter the value of USDC you want to deposit : {purpose}</h4>
        <Divider />
        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              setNewUsdc(e.target.value);
            }}
          />
          <Button
            onClick={async () => {
              console.log("newUsdc", parseEther(`${newUsdc}`));
              /* look how you call setPurpose on your contract: */
              await tx(writeContracts.Perpetual.deposit(parseEther(`${newUsdc}`)));
            }}
          >
            Submit
          </Button>
        </div>
        <Divider />
      </div>
    </div>
  );
}
