import React from "react";
import { ChakraProvider } from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Header, Image, Link } from "./components";
import { Box, Flex, Spacer } from "@chakra-ui/react"
import VaultInfo from "./components/VaultInfo.js";
import WalletHeader from "./components/WalletHeader.js";
import useWeb3Modal from "./hooks/useWeb3Modal";
import { ethers } from 'ethers';
import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

import logo from "./ethereumLogo.png";

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


function App({ Component }) {

  const [provider] = useWeb3Modal();

  // stuff for the subgraph call (not using this yet)
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  return (
    <ChakraProvider>

      {/* <Header> */}
      <Flex bgGradient="linear(to-r, red.200 0%, orange.100 25%, yellow.300 50%)">
        <Box color="gray.800" fontWeight="bold" fontSize="2em" p="4" >
          Unifi
          </Box>
        <Spacer />
        <Box p="4" >
          <WalletHeader />
        </Box>
      </Flex >
      {/* </Header> */}
      < Body>

        < VaultInfo />
        <h1>---</h1>
        <Button onClick={() => readOnChainData(provider)}>
          Read On-Chain Balance
        </Button>
      </Body >

    </ChakraProvider >
  );
}

export default App;
