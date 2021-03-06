import React from "react";
import { Center, Text } from '@chakra-ui/react';

export default function UnifiLetterLogo() {
    return (
        <Center>
            <Text
                mb='2'
                w='ssm'
                size="4xl"
                bgGradient="linear(to-r, pink.500, pink.400, blue.400, blue.600)"
                bgClip="text"
                fontWeight="extrabold"
            >
                Unifi
            </Text>
        </Center>
    )
}