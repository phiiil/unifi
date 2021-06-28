
import React from "react";
import { useEffect, useState } from "react";
import { Stat, StatLabel, StatNumber, StatHelpText } from "@chakra-ui/react"
import { Link, Image, Box, HStack } from "@chakra-ui/react"
import { FormControl, NumberInput, NumberInputField, Button, Tooltip } from "@chakra-ui/react"

import { PlusSquareIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import useWeb3Modal from "../hooks/useWeb3Modal";
import { ethers, BigNumber } from 'ethers';
import Unifi from '../abi/UnifiVault.json'
import ERC20 from '../abi/MockERC20.json'
import { Contract } from "@ethersproject/contracts";

/**
 * Component that displays information about our Vault for a specific pool
 * 
 * @returns the VaultInfo component
 */
function TokenBox({ address }) {

    const baseUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets`;
    const logoUrl = `${baseUrl}/${address}/logo.png`;
    const infoUrl = `${baseUrl}/${address}/info.json`;

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [tokenInfo, setTokenInfo] = useState();
    useEffect(() => {
        if (address && !isLoaded && !error) {
            console.log(`Getting token info: ${infoUrl}`);
            fetch(infoUrl)
                .then(res => res.json())
                .then(
                    (result) => {
                        console.log(result);
                        setIsLoaded(true);
                        setTokenInfo(result);
                    },
                    // error is better here to not hide low-level exceptions
                    (error) => {
                        console.log(error);
                        setIsLoaded(true);
                        setError(error);
                    }
                )
        }
    });



    const [provider] = useWeb3Modal();
    const [allowance, setAllowance] = useState();
    const [vaultBalance, setVaultBalance] = useState(0);
    useEffect(() => {
        if (address && provider && tokenInfo) {
            updateOnchainData();
        }
    }, [address, provider, tokenInfo]);

    const updateOnchainData = async () => {
        console.log('Update On Cahin Data');
        const signerAddress = await provider.getSigner().getAddress();
        const unifiAddress = process.env.REACT_APP_UNIFI_ADDR;
        const tokenContract = new Contract(address, ERC20.abi, provider);
        // Check Allowance
        const a = await tokenContract.allowance(signerAddress, unifiAddress);
        console.log(a);
        setAllowance(formatTokenAmount(BigNumber.from(a)));
    }

    const approveAllowance = async (e) => {
        console.log("Approve...");
        const signerAddress = await provider.getSigner().getAddress();
        const unifiAddress = process.env.REACT_APP_UNIFI_ADDR;
        const tokenContract = new Contract(address, ERC20.abi, provider.getSigner());
        // Approve Allowance of 
        const tx = await tokenContract.approve(unifiAddress, BigNumber.from("99999999999999999999"));
        await tx.wait();
        updateOnchainData();
    }

    const formatTokenAmount = (amount) => {
        if (tokenInfo) {
            return ethers.utils.formatUnits(amount, tokenInfo.decimals);
        }
        else {
            return amount.toString();
        }
    }

    if (error) {
        return <div>Error : {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
            <Box bg="gray.800" maxW="50%" p={3} borderWidth="1px" borderRadius="lg" overflow="hidden">
                <Stat >
                    <Image boxSize="2em" src={logoUrl} />
                    <StatLabel>{tokenInfo?.name}</StatLabel>
                    <StatNumber>
                        <HStack>
                            <Box>{tokenInfo?.symbol}</Box>
                            <Box>
                                <Link color="gray.500" href={tokenInfo?.explorer} isExternal>
                                    <ExternalLinkIcon boxSize="0.6em" />
                                </Link>
                            </Box>
                        </HStack>
                    </StatNumber>
                    <StatNumber>
                        <HStack>
                            <Box>Vault Balance: {vaultBalance}</Box>
                        </HStack>
                    </StatNumber>
                    <StatHelpText>
                        <HStack color="gray.500">
                            <Box>Allowance: {allowance}</Box>
                            <Tooltip hasArrow label="Approve Allowance" bg="pink.600">
                                <PlusSquareIcon w="5" h="5" color="pink" onClick={approveAllowance} />
                            </Tooltip>
                        </HStack>
                    </StatHelpText>

                </Stat>
                <FormControl>
                    <HStack>
                        <NumberInput defaultValue={0}>
                            <NumberInputField />
                        </NumberInput>
                        <Tooltip hasArrow label="Deposit in Unifi Vault" bg="pink.600">
                            <Button colorScheme="pink">Deposit {tokenInfo?.symbol}</Button>
                        </Tooltip>
                    </HStack>
                </FormControl>
            </Box>

        )
    }
}


export default TokenBox;