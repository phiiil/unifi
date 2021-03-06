import React from "react";
import { useEffect, useState } from "react";
import { Center, Divider, Button, Box, HStack, VStack } from "@chakra-ui/react"
import TokenBox from "./TokenBox.js"
// web3
import { Decimal } from "decimal.js";
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
function PairInfo() {
    const [provider] = useWeb3Modal();
    const [totalLiquidity, setTotalLiquidity] = useState();
    const [token0, setToken0] = useState(null);
    const [token1, setToken1] = useState(null);

    useEffect(() => {
        if (provider) {
            getVaultInfo();
            getPoolInfo(process.env.REACT_APP_WETH_USDC_POOL);
        }
    }, [provider]);

    /**
     * Call fucntion on the Unifi contract to display information
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

    /**
     * Call view functions on the Uniswap V3 pool to get info
     */
    const getPoolInfo = async (poolAddress) => {
        console.log(`Getting Uniswap Pool Info for ${poolAddress}`)
        const uniswapPool = new Contract(poolAddress, IUniswapV3PoolABI, provider);
        let [tickCumulatives, secondsPerLiquidityCumulativeX128s] = await uniswapPool.observe([0, 20]);
        console.log(tickCumulatives);
        let delta = tickCumulatives[0].sub(tickCumulatives[1]);
        let secondsElapsed = secondsPerLiquidityCumulativeX128s[0].sub(secondsPerLiquidityCumulativeX128s[1]);
        console.log(`delta: ${delta.toString()}`);
        console.log(`secondsElapsed: ${secondsElapsed.toString()}`);
        let currentTick = Decimal(delta.toString()).div(Decimal(secondsElapsed.toString()));
        console.log(`currentTick: ${currentTick.toString()}`);
        let price = Decimal('1.0001').pow(currentTick);
        console.log(`price: ${price.toString()}`);
        // An example of finding the price of WETH in a WETH / USDC pool, where WETH is token0 and USDC is token1:
        // You have an oracle reading that shows a return of tickCumulative as [70,000, 1,000,000], with an elapsed time between the observations of 13 seconds.
        // The current tick is 71,538.46 as expressed by the delta between the most recent and second most recent value of tickCumulative, divided by the elapsed seconds time between the readings.
        // With a tick reading of 71,538.46,, we can find the value of token0 relative to token1 by using the current tick as i' in ????(????) = 1.0001^????`
        // 1.0001^71,538.46 = 1278.56
        // tick 71,538.46 gives us a price of WETH as 1278.56 in terms of USDC

    }

    const mint = async (e) => {
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
                    fee,
                    tickLower: '196260',
                    tickUpper: '199920',
                    amount0Desired,
                    // amount1Desired: '125608504651217967263',
                    amount1Desired,
                    amount0Min: '0',
                    amount1Min: '0',
                    recipient: unifiAddress,
                    deadline
                }
                console.log(mintParams);
                // multicall and send ETH
                let mintTx = await unifi.addLiquidityEth(mintParams);
                console.log(mintTx);
            }
            catch (e) {
                console.log(e);
            }
        }
    }

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
                <Button colorScheme="pink" size="lg" onClick={mint}>Mint</Button>
            </Center>
        </VStack>
    )
}


export default VaultInfo;