/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { formatEther, parseEther } from "@ethersproject/units";
import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { Address, Balance } from "../components";
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined } from '@ant-design/icons';


export default function LoginUI({
  setRoute,
  loginUser,
}) {
  // const [newPurpose, setNewPurpose] = useState("loading...");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h1>Login</h1>
        <Divider />
        <div style={{ margin: 8 }}>
        <Input
           placeholder="Enter User Name"  prefix={<UserOutlined />}
            onChange={e => {
              setUsername(e.target.value);
            }}
          />
        <div style={{ margin: '24px 0' }} />
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter password"
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            onChange={e => {
              setPassword(e.target.value);
            }}
          />
        <Divider />
          <Button type="primary"
            onClick={async () => {
              await loginUser(username, password, setRoute);
            }}
          >
            Submit
          </Button>
        </div>
        <Divider />
        <div>
          <a className="login-form-forgot" href="">
            Forgot password
          </a>
          <br />
          <a className="login-form-forgot" href="">
            Register now!
          </a>
          </div>
      </div>
    </div>
  );
}
