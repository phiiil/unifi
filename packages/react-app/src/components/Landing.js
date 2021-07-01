// import Head from 'next/head';
import React from "react";
import {
    Box,
    Heading,
    Container,
    Text,
    Button,
    Stack,
    Icon,
    useColorModeValue,
    createIcon,
    Center,
    HStack,
} from "@chakra-ui/react";
// react-router
import { Link } from "react-router-dom";
import UnifiLetterLogo from "./UnifiLetterLogo";

export default function CallToActionWithAnnotation() {
    return (
            <Center w='100%' h='100%'>
            <Container maxW={"8xl"}>
                <Stack
                    as={Box}
                    textAlign={"center"}
                    spacing={{ base: 4, md: 8 }}
                    py={{ base: 20, md: 36 }}
                >
                    <Heading fontSize={{ base: "8xl", sm: "8xl", md: "8xl", lg: "8xl" }}>
                        {UnifiLetterLogo()}
                    </Heading>
                    <Heading
                        fontWeight={600}
                        fontSize={{ base: "2xl", sm: "4xl", md: "6xl", lg: "6xl" }}
                        lineHeight={"110%"}
                    >
                        <Text color="cyan.800"> Uniswap V3 Liquidity Manager</Text>
                    </Heading>
                    <Text fontSize="xl">Description - Place holder</Text>
                    <Stack
                        direction={"column"}
                        align={"center"}
                        alignSelf={"center"}
                        position={"relative"}
                    >
                        <Link to="/app">
                            <Button
                                colorScheme={"teal"}
                                rounded="xl"
                                boxShadow="dark-lg"
                                px={8}
                            >
                                Enter Vault
                            </Button>
                        </Link>
                    </Stack>
                </Stack>
            </Container>
            </Center>
    );
}
