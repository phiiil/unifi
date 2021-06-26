
import React from "react";
import { useEffect, useState } from "react";
import { Stat, StatLabel, StatNumber, StatHelpText } from "@chakra-ui/react"
import { Link, Image, Box, HStack } from "@chakra-ui/react"
import { FormControl, NumberInput, NumberInputField } from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'


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

    if (error) {
        return <div>Erreur : {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Chargement...</div>;
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
                    <StatHelpText>

                    </StatHelpText>
                </Stat>
                <FormControl>
                    <NumberInput defaultValue={0}>
                        <NumberInputField />
                    </NumberInput>
                </FormControl>
            </Box>

        )
    }
}


export default TokenBox;