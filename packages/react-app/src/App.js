import React from "react";
import { ChakraProvider } from "@chakra-ui/react"

import { useQuery } from "@apollo/react-hooks";
import { Center, Box, Flex, Spacer } from "@chakra-ui/react"
import VaultInfo from "./components/VaultInfo.js";
import WalletHeader from "./components/WalletHeader.js";
// import useWeb3Modal from "./hooks/useWeb3Modal";
// import { ethers } from 'ethers';
// import { getDefaultProvider } from "@ethersproject/providers";
import GET_TRANSFERS from "./graphql/subgraph";

// async function readOnChainData(provider) {
//   //const defaultProvider = getDefaultProvider();
//   // const ceaErc20 = new Contract(addresses.ceaErc20, abis.erc20, defaultProvider);
//   // const tokenBalance = await ceaErc20.balanceOf("0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C");
//   // console.log({ tokenBalance: tokenBalance.toString() });
//   // A pre-defined address that owns some CEAERC20 tokens
//   const signer = provider.getSigner();
//   const address = await signer.getAddress();
//   const rawBalance = await provider.getBalance(address);
//   const balance = ethers.utils.formatEther(rawBalance);
//   console.log(`ETH balance: ${balance}`);
// }


function App({ Component }) {

  // stuff for the subgraph call (not using this yet)
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  return (
    <ChakraProvider>

      <Flex bgGradient="linear(to-r, red.200 0%, orange.100 25%, yellow.300 50%)">
        <Box color="gray.800" fontWeight="bold" fontSize="2em" p="4" >
          Unifi
          </Box>
        <Spacer />
        <Box p="4" >
          <WalletHeader />
        </Box>
      </Flex >
      <Box w="100%" bgGradient="linear(to-r, red.200 0%, orange.100 25%, yellow.300 50%)" >
        <Center>
          < VaultInfo />
        </Center >
      </Box>
    </ChakraProvider >
  );
}

export default App;
