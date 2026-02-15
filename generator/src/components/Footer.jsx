'use client'
import {
    Box,
    Heading,
    Image,
    Link,
    Text,  
} from "@chakra-ui/react"


export default function Footer () {
    return(
        <Box bg='osuOffBlack' borderTop="4px solid #D73F09" h='fit-content' minH="100px" maxW="100%" display='flex' justifyContent='space-between'>
            <Link href='/'>
                <Image
                    src="/favicon_io_transparent/android-chrome-512x512.png"
                    alt="SESAP logo"
                    h='100px'
                    paddingLeft='15px'
                />
            </Link>

            <Box alignContent='center' m='15px'>
                <Link color='white' href='https://scarc.library.oregonstate.edu/findingaids/?p=collections/findingaid&id=3242'>
                    Special Collections and Archives Research Center
                </Link>
            </Box>
            
        </Box>
    )
}