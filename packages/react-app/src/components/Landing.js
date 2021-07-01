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
import UnifiLetterLogo from "./UnifiLetterLogo";
import { Link as RouterLink } from "react-router-dom";

export default function Landing() {
    return (
        <Center w='100%' h='100%'>
            <Container maxW={"8xl"}>
                <Stack
                    as={Box}
                    textAlign={"center"}
                    spacing={{ base: 4, md: 8 }}
                    py={{ base: 20, md: 36 }}
                    direction="column"
                >
                    <Heading fontSize={{ base: "5xl", sm: "6xl", md: "8xl", lg: "8xl" }}>
                        {UnifiLetterLogo()}
                    </Heading>
                    <Heading
                        fontWeight={600}
                        fontSize={{ base: "2xl", sm: "4xl", md: "6xl", lg: "6xl" }}
                        lineHeight={"110%"}
                    >
                        <Text color="cyan.800"> Uniswap V3 Liquidity Manager</Text>
                    </Heading>

                    <Text fontSize="lg" as="i">
                        A vault service over uniswap v3 to allow liquidity providers to create active strategies.
                    </Text>

                    <Box>
                        <Link fontSize="xl" color="teal.600" href="https://github.com/phiiil/unifi" isExternal>
                            Repo
                        </Link>
                    </Box>
                    <Box>
                        <Button as={RouterLink}
                            to="/App"
                            colorScheme={"teal"}
                            rounded="xl"
                            boxShadow="dark-lg"
                            px={8}
                        >
                            Enter Vault
                        </Button>
                    </Box>
                </Stack>
            </Container>
        </Center>
    );
}
