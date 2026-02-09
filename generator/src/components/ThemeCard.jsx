'use client'
import {
    Box,
    CloseButton,
    Drawer,
    Portal,
    Stack,
    Text,
    VStack,  
} from "@chakra-ui/react"
import Interview from "./Interview"


export default function ThemeCard ({data}) {
    return(
        
        
        <Drawer.Root size="sm">
            <Drawer.Trigger asChild>
                <Box
                    width='150px' 
                    aspectRatio='1/1'
                    borderWidth="1px" 
                    borderRadius='25px'
                    p="4"
                    spaceY="2"
                    overflow="hidden"
                    shadow="md"
                    bg='white'
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    cursor='pointer'
                    >
                    <Text fontWeight="medium" color="fg" textAlign="center">
                        {data.theme}
                    </Text>
                    <VStack color="fg.muted" justifyContent="center" gap='0'>
                        <Text textStyle='sm'>Impact Score: {data.impactScore}</Text>
                        <Text textStyle='sm'>Frequency: {data.frequency}</Text>
                    </VStack>
                </Box>
            </Drawer.Trigger>

            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content>

                        <Drawer.Header>
                            <Drawer.CloseTrigger asChild pos="initial">
                                <CloseButton />
                            </Drawer.CloseTrigger>
                            <Drawer.Title flex="1">{data.theme}</Drawer.Title>
                        </Drawer.Header>

                        <Drawer.Body>
                            <Stack direction='column' alignItems="center" gap='5'>
                                {data.interviews.map((interview, index) => (
                                    <Interview key={index} data={interview} />
                                ))}
                            </Stack>
                        </Drawer.Body>

                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    )
}