/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { formatEther, parseEther } from "@ethersproject/units";
import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch, AutoComplete, Space, Select, Radio, Form, Checkbox } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined } from '@ant-design/icons';
import React, { useState } from "react";
import { Address, Balance } from "../components";

const { Option } = Select;

export default function RegisterUI({
  setRoute,
  registerUser,
}) {
  // const [newPurpose, setNewPurpose] = useState("loading...");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("supplier");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 600, margin: "auto", marginTop: 64, padding: 60 }}>
        <h1> Registration</h1>
        <Divider />
        <div style={{ margin: 8 }}>
        {/* <Input.Group compact> */}
          <Input
           placeholder="Enter User Name"  prefix={<UserOutlined />}
            onChange={e => {
              setUsername(e.target.value);
            }}
          />
        <div style={{ margin: '24px 0' }} />

          <Input addonBefore="@"
            placeholder="Email"
            autoComplete="off"
            onChange={e => {
              setEmail(e.target.value);
            }}
          />
        <div style={{ margin: '24px 0' }} />
        <div align="left">
        <Radio.Group value={role}
            onChange={e => {
              setRole(e.target.value);
            }}
        >
          <Radio.Button value="anchor">Anchor</Radio.Button>
          <Radio.Button value="supplier">Supplier</Radio.Button>
        </Radio.Group>
        </div>
        <div style={{ margin: '24px 0' }} />
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter password"
            autoComplete="off"
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            onChange={e => {
              setPassword(e.target.value);
            }}
          />
        <div style={{ margin: '24px 0' }} />
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Re-enter password"
            autoComplete="off"
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            onChange={e => {
              setPassword2(e.target.value);
            }}
          />
        <div style={{ margin: '24px 0' }} />
          <Checkbox>
          I have read the <a href="">agreement</a>
          </Checkbox>
        <Divider />
          <Button  type="primary"
            onClick={async () => {
              if(password === password2){
                await registerUser(username, email, password, role, setRoute);
              }
            }}
          >
            Register
          </Button>
        {/* </Input.Group> */}
        </div>
        <Divider />
      </div>
    </div>
  );
}
