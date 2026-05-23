'use client'
import {
    Box,
    Button,
    CloseButton,
    Drawer,
    Link,
    Portal,
    Text,
} from "@chakra-ui/react"
import { LuMenu } from "react-icons/lu";


const links = [
    {name: 'Home', link: '/'},
    {name: 'Interviews', link: '/interviews'},
    {name: 'Insights', link: '/insights'},
    {name: 'Themes', link: '/themes'},
    {name: 'Timeline', link: '/timeline'},
    {name: 'Improvements', link: '/improvements'},
    {name: 'Search', link: '/search'},
    {name: 'About', link: '/about'},
]
export default function Navbar () {
    return (
        <Box as='nav' role='navigation' display='flex' gap='10' bg="osuNavGray" w="100%" h="100%" p={4} alignItems="center">
            {/* Drawer menu: visible on small screens only */}
            <Box display={{ base: 'block', lg: 'none' }}>
                <Drawer.Root placement='start' >
                    <Drawer.Trigger asChild>
                        <Button variant="outline" size="sm">
                            <LuMenu/>
                        </Button>
                    </Drawer.Trigger>
                    <Portal>
                        <Drawer.Backdrop />
                        <Drawer.Positioner>
                            <Drawer.Content>
                                <Drawer.Header>
                                    <Drawer.Title>Menu</Drawer.Title>
                                </Drawer.Header>
                                <Drawer.Body>
                                    <Box display='flex' flexDirection='column' gap='10' h='100%'>
                                        {links.map((l) => (
                                            <Text fontSize='md' ><Link color='black' href={l.link}>{l.name}</Link></Text>
                                        ))}
                                    </Box>
                                </Drawer.Body>
                                <Drawer.CloseTrigger asChild>
                                    <CloseButton size="sm" />
                                </Drawer.CloseTrigger>
                            </Drawer.Content>
                        </Drawer.Positioner>
                    </Portal>
                </Drawer.Root>
            </Box>

            {/* Inline links: visible on large screens only */}
            <Box display={{ base: 'none', lg: 'flex' }} gap='10' alignItems="center">
                {links.map((l) => (
                    <Link key={l.link} color='black' href={l.link}>{l.name}</Link>
                ))}
            </Box>
        </Box>
    )
}

