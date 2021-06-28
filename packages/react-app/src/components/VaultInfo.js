import React from "react";
import { useEffect, useState } from "react";
import { Center, Divider, Button, Box, HStack, VStack } from "@chakra-ui/react"
import { Stat, StatLabel, StatNumber, StatHelpText } from "@chakra-ui/react"
import { Text, StatGroup, StatArrow } from "@chakra-ui/react"
import TokenBox from "./TokenBox.js"
import { FormControl, NumberInput, NumberInputField } from "@chakra-ui/react"
// web3
import { Decimal } from "decimal.js";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { Pool } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import useWeb3Modal from "../hooks/useWeb3Modal";
import Unifi from '../abi/UnifiVault.json'
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { TickMath, tickToPrice } from '@uniswap/v3-sdk'

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
    const [balance0, setBalance0] = useState(null);
    const [balance1, setBalance1] = useState(null);
    const [unifiAddress] = useState(process.env.REACT_APP_UNIFI_ADDR);

    useEffect(() => {
        if (provider) {
            getVaultInfo();
        }
    }, [provider]);

    /**
     * Call function on the Unifi contract to display information
     */
    const getVaultInfo = async () => {
        console.log('Getting Vault Info...')
        const unifiAddress = process.env.REACT_APP_UNIFI_ADDR;
        const unifi = new Contract(unifiAddress, Unifi.abi, provider);
        let tl = await unifi.getTotalLiquidity();
        setTotalLiquidity(tl.toString());
        setToken0(await unifi.getToken0());
        setToken1(await unifi.getToken1());

    };

    const mintInitialPosition = async (e) => {
        console.log("Mint New Position");
        if (provider) {
            try {
                const unifiAddress = process.env.REACT_APP_UNIFI_ADDR;
                // connect as signer to mintPosition
                const unifi = new Contract(unifiAddress, Unifi.abi, provider.getSigner());
                const uniswapPool = new Contract(process.env.REACT_APP_WETH_USDC_POOL, IUniswapV3PoolABI, provider);

                const fee = await uniswapPool.fee()
                const amount0Desired = await unifi.getVaultBalance(token0);
                const amount1Desired = await unifi.getVaultBalance(token1);
                const deadline = Math.floor(Date.now() / 1000 + 60 * 60);

                let mintParams = {
                    token0: token0,
                    token1: token1,
                    fee: fee.toString(),
                    tickLower: '196260',
                    tickUpper: '199920',
                    amount0Desired: amount0Desired.toString(),
                    amount1Desired: amount1Desired.toString(),
                    amount0Min: '0',
                    amount1Min: '0',
                    recipient: unifiAddress,
                    deadline
                }
                console.log(mintParams);
                // multicall and send ETH
                let mintTx = await unifi.mintPosition(mintParams);
                console.log(mintTx);
            }
            catch (e) {
                console.log(e);
            }
        }
    }

    function VaultStats() {
        return (
            <Box bg="gray.800" maxW="xl" p={3} borderWidth="1px" borderRadius="lg">
                <Text fontSize="md" color="gray">
                    As a simple proof of concept, the Unifi Vault contains a single liquidity pool for WETH/USDC.
                </Text>

                <StatGroup>
                    <Stat>
                        <StatLabel>Total Liquidity</StatLabel>
                        <StatNumber>{totalLiquidity}</StatNumber>
                        <StatHelpText>
                            Total liquidity held in the Vault.
                        </StatHelpText>
                    </Stat>

                    <Stat>
                        <StatLabel>Other Value</StatLabel>
                        <StatNumber>0</StatNumber>
                        <StatHelpText>
                        </StatHelpText>
                    </Stat>
                </StatGroup>
            </Box>
        )
    }

    return (
        <VStack color="white">
            {VaultStats()}

            <Text color="black" >Unifi Vault: {unifiAddress}</Text>

            <VStack spacing="12 ">
                <TokenBox address={token0} />
                <TokenBox address={token1} />
            </VStack>


            <Box>
                <Button colorScheme="yellow" size="lg" onClick={mintInitialPosition}>Mint Initial Position</Button>
            </Box>
            <Box>

                <FormControl>
                    <HStack spacing="12 ">
                        <NumberInput defaultValue={0}>
                            <NumberInputField />
                        </NumberInput>
                        <Button colorScheme="pink" size="lg">Add ETH Liquidity</Button>
                    </HStack>
                </FormControl>

            </Box>
        </VStack>
    )


    // return (
    //     <VStack color="white">

    //         <Text color="black" >Unifi Vault: {unifiAddress}</Text>

    //         <HStack spacing="12 ">
    //             <TokenBox address={token0} />
    //             <TokenBox address={token1} />
    //         </HStack>

    //         <Box bg="gray.800" maxW="100%" p={3} borderWidth="1px" borderRadius="lg">
    //             <Text fontSize="md" color="gray">
    //                 As a simple proof of concept, the Unifi Vault contains a single liquidity pool for WETH/USDC.
    //             </Text>

    //             <StatGroup>
    //                 <Stat>
    //                     <StatLabel>Total Liquidity</StatLabel>
    //                     <StatNumber>{totalLiquidity}</StatNumber>
    //                     <StatHelpText>
    //                         Total liquidity held in the Vault.
    //                     </StatHelpText>
    //                 </Stat>

    //                 <Stat>
    //                     <StatLabel>Other Value</StatLabel>
    //                     <StatNumber>0</StatNumber>
    //                     <StatHelpText>
    //                     </StatHelpText>
    //                 </Stat>
    //             </StatGroup>
    //         </Box>
    //         <Box>
    //             <Button colorScheme="yellow" size="lg" onClick={mintInitialPosition}>Mint Initial Position</Button>
    //         </Box>
    //         <Box>

    //             <FormControl>
    //                 <HStack spacing="12 ">
    //                     <NumberInput defaultValue={0}>
    //                         <NumberInputField />
    //                     </NumberInput>
    //                     <Button colorScheme="pink" size="lg">Add ETH Liquidity</Button>
    //                 </HStack>
    //             </FormControl>

    //         </Box>
    //     </VStack>
    // )
}


export default VaultInfo;