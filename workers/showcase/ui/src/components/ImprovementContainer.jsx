'use client'
import {
    Box,
    Grid,
    GridItem,
    Link,
    Text,
} from "@chakra-ui/react"
import ImprovementCard from "./ImprovementCard"

export default function ImprovementContainer ({priority, color, improvements}) {
    return (
        <Box
            w='100%'
            p="15px"
            marginBottom='30px'
            bg='white'
            borderColor={color}
            borderWidth="1px" 
            borderRadius='5px'
            shadow="md"
        >
            <Box p='10px' borderBottomWidth='1px' borderColor='black'>
                <Text fontSize='2xl' fontWeight='semibold' >{priority} Priority</Text>
            </Box>

            <Grid 
                w='100%'
                marginTop='15px'
                display='flex'
                flexFlow='row wrap'
                templateColumns="repeat(auto-fill, 1fr)"
                alignContent='space-between'
            >
                {improvements.map((item, index) => (
                    <GridItem key={index} padding='10px' w='fit-content' >
                        <Link href={`/interviews/view?id=${item.interviewId}`}>
                            <ImprovementCard area={item.area} description={item.description} />
                        </Link>
                    </GridItem>
                ))}
            </Grid>
        </Box>
    )
}