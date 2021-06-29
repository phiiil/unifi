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
import INonfungiblePositionManager from "../abi/INonfungiblePositionManager.json";
import { TickMath, tickToPrice } from '@uniswap/v3-sdk';

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
    const [tokenId, setTokenId] = useState('');

    useEffect(() => {
        if (provider) {
            getVaultInfo();
            // console.log(token0)
        }
    }, [provider]);

    /**
     * Call function on the Unifi contract to display information
     */
    const getVaultInfo = async () => {
        console.log('Getting Vault Info...')
        const unifiAddress = process.env.REACT_APP_UNIFI_ADDR;
        const signer = provider.getSigner();
        const unifi = new Contract(unifiAddress, Unifi.abi, signer);
        const uniswapPool = new Contract(process.env.REACT_APP_WETH_USDC_POOL, IUniswapV3PoolABI, provider);
        const nft = new Contract(process.env.REACT_APP_NFT_ADDR, INonfungiblePositionManager.abi, provider);

        try {
            setTokenId(String(await unifi.vaultTokenId()));
            // console.log(tokenId)
            const { liquidity } = await nft.positions(tokenId);
            console.log("liquidity", liquidity);
            setTotalLiquidity(liquidity.toString());
        } catch (error) {}

        setToken0(await uniswapPool.token0());
        setToken1(await uniswapPool.token1());

        // await unifi.withdraw();
        // console.log(balance0)
        setBalance1(await unifi.getWethBalance());


            // console.log(uniswapPool.address)


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
                const amount0Desired = await unifi.getTokenBalance();
                const amount1Desired = await unifi.getWethBalance();
                const deadline = Math.floor(Date.now() / 1000 + 60 * 60);

                let mintParams = {
                    token0: token0,
                    token1: token1,
                    fee: fee.toString(),
                    tickLower: '196260',
                    tickUpper: '221480',
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

    const addLiquidity = async (e) => {
        console.log("Mint New Position");
        if (provider) {
            try {
                const unifiAddress = process.env.REACT_APP_UNIFI_ADDR;
                // connect as signer to mintPosition
                const unifi = new Contract(unifiAddress, Unifi.abi, provider.getSigner());
                const amount0Desired = await unifi.getTokenBalance();
                const amount1Desired = await unifi.getWethBalance();
                const deadline = Math.floor(Date.now() / 1000 + 60 * 60);
                const vaultTokenId = unifi.vaultTokenId();

                let increaseParams = {
                    tokenId: vaultTokenId,
                    amount0Desired: amount0Desired.toString(),
                    amount1Desired: amount1Desired.toString(),
                    amount0Min: '0',
                    amount1Min: '0',
                    deadline
                }
                console.log(increaseParams);
                // multicall and send ETH
                let increaseTx = await unifi.addLiquidity(increaseParams);
                console.log(increaseTx);
            }
            catch (e) {
                console.log(e);
            }
        }
    }



    const withdrawLiquidity = async (e) => {
        console.log("Withdraw liquidity");
        if (provider) {
            try {
                const unifiAddress = process.env.REACT_APP_UNIFI_ADDR;
                // connect as signer to mintPosition
                const unifi = new Contract(unifiAddress, Unifi.abi, provider.getSigner());
                console.log(provider.getSigner());
                // vault withdraws all liquidity from v3.
                await unifi.withdraw();
            }
            catch (e) {
                console.log(e);
            }
        }
    }

    // not completed
    const addLiquidityEth = async () => {
        console.log("Add liquidity ETH");
        if (provider) {
            try {
                const unifiAddress = process.env.REACT_APP_UNIFI_ADDR;
                // connect as signer to mintPosition
                const unifi = new Contract(unifiAddress, Unifi.abi, provider.getSigner());
                console.log(unifi)
                // vault withdraws all liquidity from v3.
                let addLiqTx = await unifi.addLiquidityEth();
                await addLiqTx.wait();

            }
            catch (e) {
                console.log(e);
            }
        }
    }

    return (
        <VStack color="white">

            <Text color="black" >Unifi Vault: {unifiAddress}</Text>

            <HStack spacing="12 ">
                <TokenBox address={token0} />
                <TokenBox address={token1} />
            </HStack>

            <Box bg="gray.800" maxW="100%" p={3} borderWidth="1px" borderRadius="lg">
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
            <Box>
                <Button colorScheme="yellow" size="lg" margin="1" onClick={mintInitialPosition}>Mint Initial Position</Button>
                <Button colorScheme="green" size="lg" margin="1" onClick={addLiquidity}>Add Liquidity</Button>
                <Button colorScheme="blue" size="lg" margin="1" onClick={withdrawLiquidity}>Withdraw Liquidity</Button>
            </Box>
                <Button colorScheme="blue" size="lg" margin="1" onClick={getVaultInfo}>update Vault Info</Button>
            <Box>

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
}


export default VaultInfo;
