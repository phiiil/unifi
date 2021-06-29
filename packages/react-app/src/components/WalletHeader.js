import React from "react";
import { Button } from ".";
import { useEffect, useState } from "react";
import useWeb3Modal from "../hooks/useWeb3Modal";
import { CurrencyAmount, Ether } from '@uniswap/sdk-core'
/**
 * 3 buttons to display wallet info in the header
 *
 * @returns The WalletHeader component
 */
function WalletHeader() {
    const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
    const [address, setAddress] = useState('no address');
    const [addressString, setAddressString] = useState('Connect');
    const [balance, setBalance] = useState('no balance');
    const [balanceString, setBalanceString] = useState('no balance');
    const [network, setNetwork] = useState();

    useEffect(() => {
        if (provider) {
            getWalletInfo();
        }
    }, [provider]);

    const getWalletInfo = async () => {
        if (provider) {
            // get address
            let s = provider.getSigner();
            let a = await s.getAddress()
            setAddress(a);
            let as = a.toString();
            setAddressString(as.slice(0, 6) + '...' + as.slice(-4));
            let b = await s.getBalance();
            const network = await provider.getNetwork();
            setNetwork(network);
            // console.log(network);
            let balanceCurrency = CurrencyAmount.fromRawAmount(Ether.onChain(network.chainId), b);
            setBalance(balanceCurrency);
            setBalanceString(`${balanceCurrency.toSignificant(4)} Ξ`);
        }
        else {
            console.log('no provider')
        }
    };

    return (
        <div>
            <Button>{network?.name}</Button>
            <Button>{balanceString}</Button>
            <Button
                onClick={() => {
                    if (!provider) {
                        loadWeb3Modal();
                    } else {
                        logoutOfWeb3Modal();
                    }
                }}
            >
                {!provider ? "Connect Wallet" : addressString}
            </Button>
        </div>
    );
}

export default WalletHeader;
