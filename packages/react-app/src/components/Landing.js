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
    Link
} from "@chakra-ui/react";
// react-router
import { Link as reactLink } from "react-router-dom";
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
                    <Heading fontSize={{ base: "4xl", sm: "6xl", md: "8xl", lg: "8xl" }}>
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
                    <Link fontSize="xl" color="teal.600" href="https://github.com/phiiil/unifi" isExternal>
                        Repo
                    </Link>
                        <reactLink to="/app">
                            <Button
                                colorScheme={"teal"}
                                rounded="xl"
                                boxShadow="dark-lg"
                                px={8}
                            >
                                Enter Vault
                            </Button>
                        </reactLink>

                    </Stack>
                </Stack>
            </Container>
        </Center>
    );
}
