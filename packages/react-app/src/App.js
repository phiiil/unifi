import React from "react";
import { useQuery } from "@apollo/react-hooks";
import { Center, Box, Flex, Spacer } from "@chakra-ui/react"
import VaultInfo from "./components/VaultInfo.js";
import WalletHeader from "./components/WalletHeader.js";
// import useWeb3Modal from "./hooks/useWeb3Modal";
// import { ethers } from 'ethers';
// import { getDefaultProvider } from "@ethersproject/providers";
import GET_TRANSFERS from "./graphql/subgraph";
import UnifiLetterLogo from "./components/UnifiLetterLogo";

// react-router Link
import { Link } from "react-router-dom";

function App({ Component }) {
  // stuff for the subgraph call (not using this yet)
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      // console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  return (
    <>
      <Flex bgGradient="linear(to-r, red.200 0%, orange.100 25%, yellow.300 50%)">
        <Box color="gray.800" fontWeight="bold" fontSize="2em" p="4" >
          <Link to='/'>
            Unifi
          </Link>
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
    </>
  );
}

export default App;
