import React from "react";
import { useEffect, useState } from "react";
import { Link, Image, Box, HStack, VStack, Spacer } from "@chakra-ui/react";
import {
    FormControl,
    NumberInput,
    NumberInputField,
    Tooltip,
    Center,
} from "@chakra-ui/react";

import { PlusSquareIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import useWeb3Modal from "../hooks/useWeb3Modal";
import { ethers, BigNumber } from "ethers";
import Unifi from "../abi/UnifiVault.json";
import ERC20 from "../abi/MockERC20.json";
import { Contract } from "@ethersproject/contracts";

// Stats Chakra
import {
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    StatGroup,
} from "@chakra-ui/react";

// Button Chakra
import { Button, ButtonGroup } from "@chakra-ui/react";

// Using Darkmode for allowance buttons
import {
    ChakraProvider,
    cookieStorageManager,
    localStorageManager,
} from "@chakra-ui/react";

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
                .then((res) => res.json())
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
                );
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
        console.log("Update On Cahin Data");
        const signerAddress = await provider.getSigner().getAddress();
        const unifiAddress = process.env.REACT_APP_UNIFI_ADDR;
        const unifiContract = new Contract(unifiAddress, Unifi.abi, provider);
        const tokenContract = new Contract(address, ERC20.abi, provider);
        // Check Allowance
        const a = await tokenContract.allowance(signerAddress, unifiAddress);
        console.log(a);
        setAllowance(formatTokenAmount(BigNumber.from(a)));
        // balance in the vault (no in  liquidity positions)
        const vb = await unifiContract.getVaultBalance(address);
        setVaultBalance(formatTokenAmount(BigNumber.from(vb)));
    };

    const approveAllowance = async (e) => {
        console.log("Approve...");
        const signerAddress = await provider.getSigner().getAddress();
        const unifiAddress = process.env.REACT_APP_UNIFI_ADDR;
        const tokenContract = new Contract(
            address,
            ERC20.abi,
            provider.getSigner()
        );
        // Approve Allowance of
        const tx = await tokenContract.approve(
            unifiAddress,
            BigNumber.from("99999999999999999999")
        );

        await tx.wait();
        updateOnchainData();
    };

    const revokeAllowance = async (e) => {
        console.log("Revoke...");
        const signerAddress = await provider.getSigner().getAddress();
        const unifiAddress = process.env.REACT_APP_UNIFI_ADDR;
        const tokenContract = new Contract(
            address,
            ERC20.abi,
            provider.getSigner()
        );
        // Approve Allowance of
        const tx = await tokenContract.approve(unifiAddress, BigNumber.from("0"));

        await tx.wait();
        updateOnchainData();
    };

    const formatTokenAmount = (amount) => {
        if (tokenInfo) {
            return ethers.utils.formatUnits(amount, tokenInfo.decimals);
        } else {
            return amount.toString();
        }
    };

    if (error) {
        return <div>Error : {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
            <Box
                w="xl"
                bg="gray.800"
                p={3}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
            >
                <HStack>
                    <Stat>
                        {/* <StatLabel><Center>{tokenInfo?.name}</Center></StatLabel> */}
                        <StatNumber>
                            <HStack>
                                <Image boxSize="1em" src={logoUrl} />
                                <Link href={tokenInfo?.explorer} isExternal>
                                    {tokenInfo?.symbol}
                                </Link>
                            </HStack>
                            <Box>Vault Balance: </Box>
                            <Box>{vaultBalance}</Box>
                        </StatNumber>
                        <StatHelpText>
                            <Box color="gray.500">
                                <Box>Allowance: </Box>
                                <Box>
                                    {allowance > 0 ? allowance : "Waiting for approval..."}
                                </Box>
                            </Box>
                            {/* <VStack color="gray.500">
                            {/* <Tooltip hasArrow label="Approve Allowance" bg="pink.600">
                                <PlusSquareIcon w="5" h="5" color="pink" onClick={approveAllowance} />
                            </Tooltip> */}
                            {/* </VStack> */}
                        </StatHelpText>
                    </Stat>

                    <Spacer />
                    {/* Comment: Button: Approve and Approved */}
                    {/* <Button isDisabled={allowance>0} colorScheme="telegram"  color="white" onClick={approveAllowance}>{allowance>0?"Revoke":"Approve"}</Button> */}

                    {/* Comment: Button: Approve and Revoke */}
                    <Button
                        colorScheme="teal"
                        color="white"
                        onClick={allowance > 0 ? revokeAllowance : approveAllowance}
                    >
                        {allowance > 0 ? "Revoke" : "Approve"}
                    </Button>
                </HStack>
            </Box>
        );
    }
}

export default TokenBox;
