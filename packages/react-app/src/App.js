import React from "react";
import { useCallback, useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";

import { Body, Button, Header, Image, Link } from "./components";
import logo from "./ethereumLogo.png";
import useWeb3Modal from "./hooks/useWeb3Modal";
import { ethers } from 'ethers';
import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

async function readOnChainData(provider) {
  //const defaultProvider = getDefaultProvider();
  // const ceaErc20 = new Contract(addresses.ceaErc20, abis.erc20, defaultProvider);
  // const tokenBalance = await ceaErc20.balanceOf("0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C");
  // console.log({ tokenBalance: tokenBalance.toString() });
  // A pre-defined address that owns some CEAERC20 tokens
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const rawBalance = await provider.getBalance(address);
  const balance = ethers.utils.formatEther(rawBalance);
  console.log(`ETH balance: ${balance}`);
}

function WalletButton() { //{ provider, loadWeb3Modal, logoutOfWeb3Modal }
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [address, setAddress] = useState('Connect');

  useEffect(() => {
    getWalletInfo();
  }, [provider]);

  const getWalletInfo = async () => {
    if (provider) {
      let s = provider.getSigner();
      let a = await s.getAddress()
      setAddress(a);
    }
    else {
      console.log('no provider')
    }
  };

  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : address}
    </Button>
  );
}

function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider] = useWeb3Modal();

  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  return (
    <div>
      <Header>
        <WalletButton />
      </Header>
      <Body>
        <Image src={logo} alt="react-logo" />
        <h1>This is <span style={{ color: "yellow" }}>unifi</span></h1>
        <p>
          Liquidity Strategy
        </p>
        <Button onClick={() => readOnChainData(provider)}>
          Read On-Chain Balance
        </Button>

      </Body>
    </div>
  );
}

export default App;
