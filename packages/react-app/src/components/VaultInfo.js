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
import { Box, Flex, Spacer } from "@chakra-ui/react"
import { Contract } from "@ethersproject/contracts";
import useWeb3Modal from "../hooks/useWeb3Modal";
import Unifi from '../LiquidityPro.json'

/**
 * Component that displays information about our Vault for a specific pool
 * 
 * @returns the VaultInfo component
 */
function VaultInfo() {
    const [provider] = useWeb3Modal();
    const [totalLiquidity, setTotalLiquidity] = useState();
    const [token0, setToken0] = useState();
    const [token1, setToken1] = useState();

    useEffect(() => {
        if (provider) {
            getVaultInfo();
        }
    }, [provider]);

    const getVaultInfo = async () => {
        if (provider) {
            console.log('Getting Vault Info...')
            const unifiAddress = "0x565a4D843cBEF936Cbb154480cB125191A8119Bd";
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
        <div>
            <Flex color="white">
                <Box maxW="sm" p={3} borderWidth="1px" borderRadius="lg" overflow="hidden">
                    <Stat>
                        <StatLabel>Token0</StatLabel>
                        <StatNumber>WETH</StatNumber>
                        <StatHelpText>{token0}</StatHelpText>
                    </Stat>
                </Box>
                <Spacer />
                <Box maxW="sm" p={3} borderWidth="1px" borderRadius="lg" overflow="hidden">
                    <Stat>
                        <StatLabel>Token1</StatLabel>
                        <StatNumber>USDC</StatNumber>
                        <StatHelpText>{token1}</StatHelpText>
                    </Stat>
                </Box>
            </Flex>

            <div>
                Total Liquidity: {totalLiquidity}
            </div>
        </div>
    )
}


export default VaultInfo;