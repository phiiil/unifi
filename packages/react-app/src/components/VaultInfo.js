import React from "react";
import { useEffect, useState } from "react";
import { Center, Divider, Button, Box, HStack, VStack } from "@chakra-ui/react"
import { Stat, StatLabel, StatNumber, StatHelpText } from "@chakra-ui/react"
import { Text, StatGroup, StatArrow, Input } from "@chakra-ui/react"
import TokenBox from "./TokenBox.js"
import { FormControl, NumberInput, NumberInputField } from "@chakra-ui/react"
// web3
import { Decimal } from "decimal.js";
import { ethers, BigNumber } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { Pool, Position } from "@uniswap/v3-sdk";
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
    const [positionAmount0, setPositionAmount0] = useState(null);
    const [positionAmount1, setPositionAmount1] = useState(null);
    const [vaultTickLower, setVaultTickLower] = useState(null);
    const [vaultTickUpper, setVaultTickUpper] = useState(null);
    const [currentTick, setCurrentTick] = useState(null);

    const [wethPrice, setWethPrice] = useState(null);
    const [unifiAddress] = useState(process.env.REACT_APP_UNIFI_ADDR);
    const [tokenId, setTokenId] = useState('');
    const twoPower96 = BigNumber.from(2).pow(96);

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

        // vault may not be initiated
        try {
            setTokenId(String(await unifi.vaultTokenId()));
            // console.log(tokenId)
            // await unifi.updateWethPrice();

            // const p = await unifi.ethPrice();
            // console.log(ethers.utils.formatUnits(p, '6'));
            // setWethPrice(ethers.utils.formatUnits(p, '6'));
            let { liquidity } = await nft.positions(tokenId);
            console.log("vault liquidity", liquidity)

            setTotalLiquidity(liquidity.toString());
        } catch (error) { }

        const { sqrtPriceX96, tick } = await uniswapPool.slot0();
        console.log("sqrtPriceX96", sqrtPriceX96.toString());
        // (sqrtPriceX96/2^96)^2
        let usdcPrice = sqrtPriceX96.div(BigNumber.from(2).pow(96)).pow(2).toNumber();
        console.log("price", usdcPrice)
        // let p = Math.floor((1/usdcPrice) * 1e18);
        // console.log("price", p);
        const fee = await uniswapPool.fee();
        const t1 = uniswapPool.token0();
        const t2 = uniswapPool.token1();
        Promise.all([t1, t2]).then(async (res) => {
            setToken0(res[0]);
            setToken1(res[1]);
            const tokenA = new Token(1, res[0], 6, 'USDC', 'USDC');
            const tokenB = new Token(1, res[1], 18, 'WETH', 'WETH');
            const pool = new Pool(tokenA, tokenB, fee, sqrtPriceX96, 0, tick);
            console.log("token0 price", Number(pool.token1Price.toSignificant(10)));
            setWethPrice(pool.token1Price.toSignificant(10));
            setCurrentTick(tick);
            try {
                const { liquidity, tickLower, tickUpper } = await nft.positions(tokenId);
                const position = new Position({
                    pool,
                    liquidity,
                    tickLower,
                    tickUpper
                });
                setVaultTickLower(tickLower);
                setVaultTickUpper(tickUpper);
                setPositionAmount0(ethers.utils.formatUnits(position.amount0.quotient.toString(), '6'));
                setPositionAmount1(ethers.utils.formatEther(position.amount1.quotient.toString()));

            } catch (e) {
                console.log(e)
            }
        });



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
                    // tickLower: '196260',
                    tickLower: vaultTickLower.toString(),
                    tickUpper: vaultTickUpper.toString(),
                    // tickUpper: '221480',
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

    const handleLowerInput = async (e) => {
        e.preventDefault();
        // console.log(e.target.value);
        try {
            setVaultTickLower(e.target.value);
            console.log(vaultTickLower)
            // let price = Math.floor((1/Number(e.target.value)) * 1e18 / 1e6);
            // console.log(price)
            // let sqrtPrice = BigNumber.from(price).pow(0.5).mul(twoPower96);
            // let sqrtPrice = Math.sqrt(price);
            // let sqrtPrice = ();
            // console.log("sqrt price", (BigNumber.from(sqrtPrice).mul(twoPower96)).toString());
        } catch (e) { }
    }

    const handleUpperInput = async (e) => {
        e.preventDefault();
        try {
            setVaultTickUpper(e.target.value);
            console.log(vaultTickUpper);
        } catch (e) { }
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

    function VaultStats() {
        return (
            <Box>
                <Box bg="gray.800" w="xl" p={4} borderWidth="1px" borderRadius="lg">
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
                            <StatLabel>ETH price</StatLabel>
                            <StatNumber>{wethPrice}</StatNumber>
                            <StatHelpText>
                            </StatHelpText>
                        </Stat>
                    </StatGroup>

                    <StatGroup>
                        <Stat>
                            <StatLabel>USDC</StatLabel>
                            <StatNumber>{positionAmount0}</StatNumber>
                            <StatHelpText>
                            </StatHelpText>
                        </Stat>

                        <Stat>
                            <StatLabel>WETH</StatLabel>
                            <StatNumber>{positionAmount1}</StatNumber>
                            <StatHelpText>
                            </StatHelpText>
                        </Stat>
                    </StatGroup>

                    <StatGroup>
                        <Stat>
                            <StatLabel>Current Tick</StatLabel>
                            <StatNumber>{currentTick}</StatNumber>
                            <StatHelpText>
                            </StatHelpText>
                        </Stat>

                        <Stat>
                            <StatLabel>TickLower</StatLabel>
                            <StatNumber>{vaultTickLower}</StatNumber>
                            <StatHelpText>
                            </StatHelpText>
                        </Stat>

                        <Stat>
                            <StatLabel>TickUpper</StatLabel>
                            <StatNumber>{vaultTickUpper}</StatNumber>
                            <StatHelpText>
                            </StatHelpText>
                        </Stat>
                    </StatGroup>
                </Box>
                <Box color='gray.800'>
                    <Text mb="8px">Price Lower: </Text>
                    <Input
                        // value={value}
                        onChange={handleLowerInput}
                        placeholder="Lower limit of your price range"
                        size="sm"
                    />
                    <Text mb="8px">Price Upper </Text>
                    <Input
                        // value={value}
                        onChange={handleUpperInput}
                        placeholder="Upper limit of your price range"
                        size="sm"
                    />
                    <Button colorScheme="yellow" size="lg" margin="1" onClick={mintInitialPosition}>Mint New Position</Button>
                </Box>
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

                <Button colorScheme="green" size="lg" margin="1" onClick={addLiquidity}>Add Liquidity</Button>
                <Button colorScheme="blue" size="lg" margin="1" onClick={withdrawLiquidity}>Withdraw Liquidity</Button>
                <Button colorScheme="blue" size="lg" margin="1" onClick={getVaultInfo}>update Vault Info</Button>
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
