"use client"
import {
    Box,
    Button,
    ButtonGroup,
    Container,
    Grid,
    GridItem,
    Heading,
    IconButton,
    Link,
    Menu,
    Pagination,
    Portal,
} from "@chakra-ui/react"
import { useState, useMemo } from "react"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi"
import Interview from '@/components/Interview'


const pageSize = 9

const data = [
    {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
    {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
    {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
    {interviewId: '3', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2022-03-31', description: ""},
    {interviewId: '4', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2023-03-31', description: ""},
    {interviewId: '5', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2023-04-30', description: ""},
    {interviewId: '6', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-05-31', description: ""},
    {interviewId: '7', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2025-05-31', description: ""},
    {interviewId: '8', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-05-25', description: ""},
    {interviewId: '9', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
    {interviewId: '10', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2023-03-31', description: ""},
]

export default function Interviews() {
    const [page, setPage] = useState(1)
    const [sortBy, setSortBy] = useState('name-asc') // 'date-asc' (oldest), 'date-desc' (newest), 'name-asc', 'name-desc'

    // Sort data based on selected option
    const sortedData = useMemo(() => {
        const sorted = [...data]
        if (sortBy === 'name-asc') {
            sorted.sort((a, b) => a.name.localeCompare(b.name))
        } else if (sortBy === 'name-desc') {
            sorted.sort((a, b) => b.name.localeCompare(a.name))
        } else if (sortBy === 'date-asc') {
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date))
        } else if (sortBy === 'date-desc') {
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date))
        }
        return sorted
    }, [sortBy])

    const startRange = (page - 1) * pageSize
    const endRange = startRange + pageSize

    const visibleItems = sortedData.slice(startRange, endRange)

    return (
        <>
            <Heading>Interviews</Heading>
            <Link color='blue' href='/interviews/template'>Template</Link>

            {/* Sort Menu */}
            <Container centerContent='true'>
                <Box alignSelf='flex-end'>
                    <Menu.Root mb={4} >
                        <Menu.Trigger asChild>
                            <Button variant="outline">
                                Sort by: {
                                    sortBy === 'name-asc' ? 'Name (A to Z)' :
                                    sortBy === 'name-desc' ? 'Name (Z to A)' :
                                    sortBy === 'date-asc' ? 'Date (Oldest)' :
                                    'Date (Newest)'
                                }
                            </Button>
                        </Menu.Trigger>
                        
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content>
                                    <Menu.Item
                                        onClick={() => {
                                            setSortBy('date-asc')
                                            setPage(1) // Reset to first page when sorting changes
                                        }}
                                    >
                                        Date (Oldest)
                                    </Menu.Item>
                                    <Menu.Item
                                        onClick={() => {
                                            setSortBy('date-desc')
                                            setPage(1)
                                        }}
                                    >
                                        Date (Newest)
                                    </Menu.Item>
                                    <Menu.Item
                                        onClick={() => {
                                            setSortBy('name-asc')
                                            setPage(1)
                                        }}
                                    >
                                        Name (A to Z)
                                    </Menu.Item>
                                    <Menu.Item
                                        onClick={() => {
                                            setSortBy('name-desc')
                                            setPage(1)
                                        }}
                                    >
                                        Name (Z to A)
                                    </Menu.Item>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                </Box>
                
                {/* Interview Grid */}
                <Container centerContent='true'>
                    <Grid templateColumns="repeat(3, 1fr)" templateRows='repeat(3, 1fr)'>
                        {visibleItems.map((item, index) => (
                            <GridItem key={index} 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            padding='30px'>
                                <Interview data={item} />
                            </GridItem>
                        ))}
                    </Grid>
                </Container>
                
                {/* Pagination */}
                <Pagination.Root
                    count={sortedData.length}
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