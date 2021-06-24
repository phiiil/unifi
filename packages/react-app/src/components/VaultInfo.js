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
import { Center, Divider, Button, Image, Box, Flex, Spacer } from "@chakra-ui/react"
import { Contract } from "@ethersproject/contracts";
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
    const [token0, setToken0] = useState('0x0000000000000000');
    const [token1, setToken1] = useState('0x0000000000000000');

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
        <Box >
            <Box>
                Total Liquidity: {totalLiquidity}
            </Box>
            <Divider />
            <Flex color="white">
                <Box bg="gray.800" maxW="sm" p={3} borderWidth="1px" borderRadius="lg" overflow="hidden">
                    <Stat>
                        <Image boxSize="2em" src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token0}/logo.png`} />
                        <StatLabel>Token0</StatLabel>
                        <StatNumber>USDC</StatNumber>
                        <StatHelpText>{token0}</StatHelpText>
                    </Stat>
                </Box>
                <Spacer />
                <Box bg="gray.800" maxW="sm" p={3} borderWidth="1px" borderRadius="lg" overflow="hidden">
                    <Stat>
                        <Image boxSize="2em" src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token1}/logo.png`} />
                        <StatLabel>Token1</StatLabel>
                        <StatNumber>WETH</StatNumber>
                        <StatHelpText>{token1}</StatHelpText>
                    </Stat>
                </Box>
            </Flex>

            <Center>
                <Button colorScheme="yellow" size="lg">Deposit</Button>
                <Button colorScheme="pink" size="lg">Mint</Button>
            </Center>
        </Box>
    )
}


export default VaultInfo;