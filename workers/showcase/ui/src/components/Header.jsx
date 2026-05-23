'use client'
import {
    Box,
    HStack,
    Image,
    Link,
    StackSeparator,
    Text,  
} from "@chakra-ui/react"


export default function Header () {
    return(
        <Box as='header' role='banner' bg='white' h="100px" maxW="100%">
            <HStack h='100%' separator={<StackSeparator />}>
                <Box>
                    <Link href='https://oregonstate.edu'>
                        <Image src="/OSU_horizontal_2C_O_over_B.png" alt="OSU logo" maxH="75px" maxW="100%" margin='10px' />
                    </Link>
                </Box>

                <Box padding='10px' display='flex' flexDirection='column'>
                    <Link href='https://engineering.oregonstate.edu/EECS'>
                        <Text fontSize="lg" fontWeight="medium" >
                            Electrical Engineering and Computer Science
                        </Text>
                    </Link>
                    <Link href='\'>
                        <Text color='beavOrange' fontSize="2xl" fontWeight="bold" >
                            Student Experience Story Archive Project
                        </Text>
                    </Link>
                </Box>
            </HStack>
        </Box>
    )
}
