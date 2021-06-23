import React from "react";
import { useEffect, useState } from "react";
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
            <div>token0: <span >{token0}</span></div>
            <div>token1: <span >{token1}</span></div>
            <div>
                Total Liquidity: {totalLiquidity}
            </div>
        </div>
    )
}


export default VaultInfo;