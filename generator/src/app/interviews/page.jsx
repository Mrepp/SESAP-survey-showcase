"use client"
import {
    Box,
    ButtonGroup,
    Container,
    Grid,
    GridItem,
    Heading,
    IconButton,
    Link,
    Pagination,
} from "@chakra-ui/react"
import { useState } from "react"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi"

const pageSize = 9
const count = 50
const items = new Array(count)
  .fill(0)
  .map((_, index) => `Example ${index + 1}`)

export default function Interviews() {
    const [page, setPage] = useState(1)

    const startRange = (page - 1) * pageSize
    const endRange = startRange + pageSize

    const visibleItems = items.slice(startRange, endRange)

    return (
        <>
            <Heading>Interviews</Heading>
            <Link color='blue' href='/interviews/template'>Template</Link>
            <Container centerContent='true'>
                <Container>
                    <Grid templateColumns="repeat(3, 1fr)" templateRows='repeat(3, 1fr)'>
                        {visibleItems.map((item) => (
                            <GridItem key={item} 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            padding='30%'>
                                <Box outline='solid' outlineWidth='1px'>
                                    {item}
                                </Box>
                            </GridItem>
                        ))}
                    </Grid>
                </Container>
                
                <Pagination.Root
                    count={count}
                    pageSize={pageSize}
                    page={page}
                    onPageChange={(e) => setPage(e.page)}
                >
                    <ButtonGroup variant="ghost" size="sm">
                    <Pagination.PrevTrigger asChild>
                        <IconButton>
                        <HiChevronLeft />
                        </IconButton>
                    </Pagination.PrevTrigger>

                    <Pagination.Items
                        render={(page) => (
                        <IconButton variant={{ base: "ghost", _selected: "outline" }}>
                            {page.value}
                        </IconButton>
                        )}
                    />

                    <Pagination.NextTrigger asChild>
                        <IconButton>
                        <HiChevronRight />
                        </IconButton>
                    </Pagination.NextTrigger>
                    </ButtonGroup>
                </Pagination.Root>
            </Container>
        </>
    )
}