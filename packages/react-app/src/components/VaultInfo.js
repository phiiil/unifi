import React from "react";
import { useEffect, useState } from "react";
import {
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    StatGroup,
} from "@chakra-ui/react"
import { Center, Divider, Button, Image, Box, HStack, VStack } from "@chakra-ui/react"
import { FormControl, NumberInput, NumberInputField } from "@chakra-ui/react"
import { Link } from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Contract } from "@ethersproject/contracts";
import TokenBox from "./TokenBox.js"
import useWeb3Modal from "../hooks/useWeb3Modal";
import Unifi from '../abi/LiquidityPro.json'

/**
 * Component that displays information about our Vault for a specific pool
 * 
 * @returns the VaultInfo component
 */
function VaultInfo() {
    const [provider] = useWeb3Modal();
    const [totalLiquidity, setTotalLiquidity] = useState();
    const [token0, setToken0] = useState(null);
    const [token1, setToken1] = useState(null);

    useEffect(() => {
        if (provider) {
            getVaultInfo();
        }
    }, [provider]);

    const getVaultInfo = async () => {
        if (provider) {
            console.log('Getting Vault Info...')
            const unifiAddress = process.env.REACT_APP_UNIFI_ADDR;
            const unifiAbi = {};

            const unifiContract = new Contract(unifiAddress, Unifi.abi, provider);
            let tl = await unifiContract.getTotalLiquidity();
            setTotalLiquidity(tl.toString());
            setToken0(await unifiContract.getToken0());
            setToken1(await unifiContract.getToken1());
        }
        else {
            console.log('no provider')
        }
    };

    return (
        <VStack color="white">
            <Box>
                Total Liquidity: {totalLiquidity}
            </Box>

            <Divider />
            <HStack spacing="12 ">
                <TokenBox address={token0} />
                <TokenBox address={token1} />
            </HStack>

            <Center>
                <Button colorScheme="yellow" size="lg">Deposit</Button>
                <Button colorScheme="pink" size="lg">Mint</Button>
            </Center>
        </VStack>
    )
}


export default VaultInfo;