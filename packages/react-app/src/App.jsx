import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { formatEther, parseEther } from "@ethersproject/units";
import Portis from "@portis/web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Alert, Button, Col, Menu, Row, notification } from "antd";
import "antd/dist/antd.css";
import { useUserAddress } from "eth-hooks";
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import { UserAccount, Account, Contract, Faucet, GasGauge, Header, Ramp, ThemeSwitch } from "./components";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";

import { Zora, 
  constructBidShares,
  constructMediaData,
  sha256FromBuffer,
  generateMetadata,
} from '@zoralabs/zdk'

import {
  useBalance,
  useContractLoader,
  useContractReader,
  useEventListener,
  useExchangePrice,
  useExternalContractLoader,
  useGasPrice,
  useOnBlock,
  useUserProvider,
} from "./hooks";
import AuthService from "./authServices/auth.service";
// import Hints from "./Hints";
import { ExampleUI, Hints, Subgraph, SupplierUI, AnchorUI, LoginUI, RegisterUI, HistoryUI, HomeUI, DepositUI } from "./views";

const { ethers } = require("ethers");

/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
// const targetNetwork = NETWORKS.kovan; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)
const targetNetwork = NETWORKS.mumbai; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console llocalhostogging
const DEBUG = true;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
const scaffoldEthProvider = new StaticJsonRpcProvider("https://matic-mumbai.chainstacklabs.com");
const mainnetInfura = new StaticJsonRpcProvider("https://matic-mumbai.chainstacklabs.com");
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_I

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new StaticJsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  network: {chainId: 80001, nodeUrl:"https://matic-mumbai.chainstacklabs.com" }, // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
    portis: {
      package: Portis, // required
      options: {
        id: "baf845c0-7334-4c4a-8f3c-c1f09023ff1a", // required
      }
    }
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

function App(props) {
  const mainnetProvider = scaffoldEthProvider && scaffoldEthProvider._network ? scaffoldEthProvider : mainnetInfura;

  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);

  const zora = new Zora(userProvider.getSigner(),targetNetwork.chainId);
  const address = useUserAddress(userProvider);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider);

  // const writeExternalContracts = useContractLoader(injectedProvider, { chainId: 80001,
  //   externalContracts: ERC20ContractMetadata,
  // });

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  // const mumbaiUSDCContract = useExternalContractLoader(mainnetProvider, "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e", ERC20ABI);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    // console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  // Then read your DAI balance like:
  // const myMainnetDAIBalance = useContractReader({ DAI: mainnetDAIContract }, "DAI", "balanceOf", [
  //   "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  // ]);

  // keep track of a variable from the contract in the local React state:
  const purpose = 0//useContractReader(readContracts, "CashflowTokens", "balanceOf");

  
  // 📟 Listen for broadcast events
  // const setPurposeEvents = useEventListener(readContracts, "CashflowTokens", "SetPurpose", localProvider, 1);

  // const cashflowContract = useContractReader(readContracts, "CashflowTokens", "balanceOf");
  // const setCashflowEvents = useEventListener(readContracts, "CashflowTokens", "SetCashflow", localProvider, 1);
  // console.log(" cashflowContract ", cashflowContract, setCashflowEvents);

  // const MultisigWalletContract = useContractReader(readContracts, "MultisigWallet", "balanceOf");
  // const setMultisigWalletContract = useEventListener(readContracts, "MultisigWallet", "SetCashflow", localProvider, 1);
  // console.log(" MultisigWallet ", MultisigWalletContract, setMultisigWalletContract);


  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  // useEffect(() => {
  //   if (
  //     DEBUG &&
  //     mainnetProvider &&
  //     address &&
  //     selectedChainId &&
  //     yourLocalBalance &&
  //     yourMainnetBalance &&
  //     readContracts &&
  //     writeContracts &&
  //     mainnetDAIContract
  //   ) {
  //     console.log(" ******** readContracts ", readContracts);
  //     console.log(" *********** writeContracts ", writeContracts);
  //     console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
  //     console.log("🌎 mainnetProvider", mainnetProvider);
  //     console.log("🏠 localChainId", localChainId);
  //     console.log("👩‍💼 selected address:", address);
  //     console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
  //     console.log("💵 yourLocalBalance", yourLocalBalance ? formatEther(yourLocalBalance) : "...");
  //     console.log("💵 yourMainnetBalance", yourMainnetBalance ? formatEther(yourMainnetBalance) : "...");
  //     console.log("📝 readContracts", readContracts);
  //     console.log("🌍 DAI contract on mainnet:", mainnetDAIContract);
  //     console.log("🔐 writeContracts", writeContracts);
  //   }
  // }, [
  //   mainnetProvider,
  //   address,
  //   selectedChainId,
  //   yourLocalBalance,
  //   yourMainnetBalance,
  //   readContracts,
  //   writeContracts,
  //   mainnetDAIContract,
  // ]);


  let networkDisplay = "";
  if (localChainId && selectedChainId && localChainId !== selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    if (selectedChainId === 1337 && localChainId === 31337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network"
            description={
              <div>
                You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                <b>{networkLocal && networkLocal.name}</b>.
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    console.log("~~~~~~~~~~~~~~~~~~~~ setRoute Called "+route);
    setRoute(window.location.pathname);
  }, [setRoute, route]);

  const goToLogin = () => {
    console.log(" goToLogin ");
    setRoute("/loginui");
  }

  const goToRegister = () => {
    console.log(" goToRegister ");
    setRoute("/registerui");
  }
  const [api, contextHolder] = notification.useNotification();
  const Context = React.createContext({ name: 'Default' });


  const ROLES = ["anchor", "admin", "supplier"];

  const [userloginData, setUserloginData] = useState("");
  const [regStatus, setRegStatus] = useState("");

  const registerUser = (username, email, password, role, setRoute) => {
    AuthService.register(username, email, password, [role])
    .then(
      response => {
        console.log("registerUser response", response);
        // this.setState({
        //   message: response.data.message,
        //   successful: true
        // });
        setRegStatus(response && response.data && response.data.message);
        notification.open({
          message: 'Registration Successful',
          description:
            '',
          className: 'custom-class',
          style: {
            width: 400,
          },
        });
      },
      error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
            console.log("resMessage ", resMessage);

      }
    );
  };
  const loginUser = (username, password, setRoute) => {
    AuthService.login(username, password)
    .then(
      response => {
        console.log("loginUser response", response);
        setUserloginData(response && response.data && response.data.message);
        notification.open({
          message: 'Login Successful',
          description:
            '',
          className: 'custom-class',
          style: {
            width: 400,
          },
        });
        setRoute("/loginui");
      },
      error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
            console.log("resMessage ", resMessage);

      }
    );
  };
  let faucetHint = "";
  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name === "localhost";

  const [faucetClicked, setFaucetClicked] = useState(false);
  if (
    !faucetClicked &&
    localProvider &&
    localProvider._network &&
    localProvider._network.chainId === 31337 &&
    yourLocalBalance &&
    formatEther(yourLocalBalance) <= 0
  ) {
    faucetHint = (
      <div style={{ padding: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            faucetTx({
              to: address,
              value: parseEther("0.01"),
            });
            setFaucetClicked(true);
          }}
        >
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    );
  }

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {networkDisplay}
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              Home
            </Link>
          </Menu.Item>
          <Menu.Item key="/supplierui">
            <Link
              onClick={() => {
                setRoute("/supplierui");
              }}
              to="/supplierui"
            >
              Filters
            </Link>
          </Menu.Item>
          <Menu.Item key="/anchorui">
            <Link
              onClick={() => {
                setRoute("/anchorui");
              }}
              to="/anchorui"
            >
              Pictures
            </Link>
          </Menu.Item>
          <Menu.Item key="/history">
            <Link
              onClick={() => {
                setRoute("/history");
              }}
              to="/history"
            >
              Videos
            </Link>
          </Menu.Item>
          <Menu.Item key="/depositui">
            <Link
              onClick={() => {
                setRoute("/depositui");
              }}
              to="/depositui"
            >
              LIVE Stream
            </Link>
          </Menu.Item>
          <Menu.Item key="/subgraph">
            <Link
              onClick={() => {
                setRoute("/subgraph");
              }}
              to="/subgraph"
            >
              Subgraph
            </Link>
          </Menu.Item>
          {/* <Menu.Item key="/loginui">
            <Link
              onClick={() => {
                setRoute("/loginui");
              }}
              to="/loginui"
            >
              Login
            </Link>
          </Menu.Item>
          <Menu.Item key="/registerui">
            <Link
              onClick={() => {
                setRoute("/registerui");
              }}
              to="/registerui"
            >
              Register
            </Link> */}
          {/* </Menu.Item> */}
          {/* <Menu.Item key="/hints">
            <Link
              onClick={() => {
                setRoute("/hints");
              }}
              to="/hints"
            >
              Hints
            </Link>
          </Menu.Item>
          <Menu.Item key="/exampleui">
            <Link
              onClick={() => {
                setRoute("/exampleui");
              }}
              to="/exampleui"
            >
              ExampleUI
            </Link>
          </Menu.Item>
          <Menu.Item key="/mainnetdai">
            <Link
              onClick={() => {
                setRoute("/mainnetdai");
              }}
              to="/mainnetdai"
            >
              Mainnet DAI
            </Link>
          </Menu.Item>
          <Menu.Item key="/subgraph">
            <Link
              onClick={() => {
                setRoute("/subgraph");
              }}
              to="/subgraph"
            >
              Subgraph
            </Link>
          </Menu.Item> */}
        </Menu>

        <Switch>
          <Route exact path="/">
          <HomeUI
              name="CashflowTokens"
              mmAddress={address}
              signer={userProvider.getSigner()}
              provider={localProvider}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              address={address}
              blockExplorer={blockExplorer}
            />
          {/* <Contract
              name="USDC"
              mmAddress={address}
              signer={userProvider.getSigner()}
              provider={localProvider}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              address={address}
              blockExplorer={blockExplorer}
            /> */}
          </Route>
          <Route path="/supplierui">
            <SupplierUI
              address={address}
              chainId={selectedChainId}
              provider={localProvider}
              userProvider={userProvider}
              mainnetProvider={mainnetProvider}
              useContractLoader={useContractLoader}
              // localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              zora={zora}
              constructBidShares = {constructBidShares} 
              constructMediaData = {constructMediaData} 
              sha256FromBuffer = {sha256FromBuffer} 
              generateMetadata = {generateMetadata} 
              // MultisigWalletContract={MultisigWalletContract}
              // setMultisigWalletContract={setMultisigWalletContract}
            />
          </Route>
          {/* <Route path="/loginui">
            <LoginUI
              setRoute={setRoute}
              loginUser={loginUser}
            />
          </Route> */}
          <Route path="/anchorui">
            <AnchorUI
              signer={userProvider.getSigner()}
              provider={localProvider}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              address={address}
              blockExplorer={blockExplorer}
              loginUser={loginUser}
              // cashflowContract={cashflowContract}
              // setCashflowEvents={setCashflowEvents}
            />
          </Route>
          <Route path="/history">
            <HistoryUI
              signer={userProvider.getSigner()}
              provider={localProvider}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              address={address}
              blockExplorer={blockExplorer}
              loginUser={loginUser}
            />
          </Route>

          <Route path="/depositui">
            <DepositUI
              name="CashflowTokens"
              mmAddress={address}
              signer={userProvider.getSigner()}
              provider={localProvider}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              address={address}
              blockExplorer={blockExplorer}
              // cashflowContract={cashflowContract}
              // setCashflowEvents={setCashflowEvents}
            />
          </Route>
          {/* <Route path="/registerui">
            <RegisterUI
              setRoute={setRoute}
              registerUser={registerUser}
              userProvider={userProvider}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
            />
          </Route> */}
          {/* <Route path="/hints">
            <Hints
              address={address}
              yourLocalBalance={yourLocalBalance}
              mainnetProvider={mainnetProvider}
              price={price}
            />
          </Route> */}
          {/* <Route path="/exampleui">
            <ExampleUI
              address={address}
              userProvider={userProvider}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              purpose={purpose}
              setPurposeEvents={setPurposeEvents}
            />
          </Route> */}
          <Route path="/subgraph">
            <Subgraph
              subgraphUri={props.subgraphUri}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              mainnetProvider={mainnetProvider}
              // cashflowContract={cashflowContract}
              // setCashflowEvents={setCashflowEvents}
            />
          </Route>
          {/* <Route path="/mainnetdai">
            <Contract
              name="DAI"
              customContract={mainnetDAIContract}
              signer={userProvider.getSigner()}
              provider={mainnetProvider}
              address={address}
              blockExplorer="https://etherscan.io/"
            />
          </Route> */}
        </Switch>
      </BrowserRouter>

      <ThemeSwitch />

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
        {faucetHint}
      </div>
      {/* <div style={{ position: "fixed", textAlign: "right", right: 500, top: 0, padding: 10 }}>
        <UserAccount
          goToLogin={goToLogin}
          goToRegister={goToRegister}
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
          goToLogin={goToLogin}
          goToRegister={goToRegister}
        />
        {faucetHint}
      </div> */}
    </div>
  );
}

/* eslint-disable */
window.ethereum &&
  window.ethereum.on("chainChanged", chainId => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });

window.ethereum &&
  window.ethereum.on("accountsChanged", accounts => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });
/* eslint-enable */

export default App;
