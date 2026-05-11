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
    Stack,
    StackSeparator,
    Text,
} from "@chakra-ui/react"
import { useEffect, useMemo, useState } from "react"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi"
import { useDataLoader } from '@/hooks/useDataLoader'
import { standardize, formatDate, interviewDateYearString, buildMajorOptions, buildYearOptions } from '@/app/buildFunctions'
import Filters from '@/components/Filters'
import Interview from '@/components/Interview'


const pageSize = 9

const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }

export default function Interviews() {
    const { progress, statusText, error, isReady, data, reload } = useDataLoader()
    const [page, setPage] = useState(1)
    const [sortBy, setSortBy] = useState('date-desc')
    const [selectedMajors, setSelectedMajors] = useState([])
    const [selectedYears, setSelectedYears] = useState([])

    // Map interviews (from useDataLoader) to the shape expected by Interview component
    const dataList = useMemo(() => {
        const raw = data?.interviews
        if (!Array.isArray(raw)) return []
        return raw.map((iv) => ({
            interviewId: iv.id,
            videoUrl: '/thumbnail.png',
            videoAlt: `${iv.title ?? iv.id} interview`,
            name: iv.title ?? 'Interviewee Name',
            date: formatDate(iv.metadata.interviewDate, dateOptions),
            major: standardize(iv.demographics?.major),
            year: interviewDateYearString(iv),
        }))
    }, [data?.interviews])

    const majorOptions = useMemo(
        () => buildMajorOptions(data?.interviews),
        [data?.interviews]
    )

    const yearOptions = useMemo(
        () => buildYearOptions(data?.interviews),
        [data?.interviews]
    )

    const filteredData = useMemo(() => {
        let list = dataList
        if (selectedMajors.length > 0) {
            list = list.filter((iv) => selectedMajors.includes(iv.major))
        }
        if (selectedYears.length > 0) {
            list = list.filter((iv) => iv.year && selectedYears.includes(iv.year))
        }
        return list
    }, [dataList, selectedMajors, selectedYears])

    // Sort data based on selected option
    const sortedData = useMemo(() => {
        const sorted = [...filteredData]
        if (sortBy === 'name-asc') {
            sorted.sort((a, b) => (a.name || a.interviewId).localeCompare(b.name || b.interviewId))
        } else if (sortBy === 'name-desc') {
            sorted.sort((a, b) => (b.name || b.interviewId).localeCompare(a.name || a.interviewId))
        } else if (sortBy === 'date-asc') {
            sorted.sort((a, b) => (new Date(a.date) || 0) - (new Date(b.date) || 0))
        } else if (sortBy === 'date-desc') {
            sorted.sort((a, b) => (new Date(b.date) || 0) - (new Date(a.date) || 0))
        }
        return sorted
    }, [sortBy, filteredData])

    useEffect(() => {
        setPage(1)
    }, [selectedMajors, selectedYears])

    const startRange = (page - 1) * pageSize
    const endRange = startRange + pageSize

    const visibleItems = sortedData.slice(startRange, endRange)

    if (!isReady) {
        return (
            <>
                <Heading>Interviews</Heading>
                <Text>{statusText}</Text>
                {error != null && <Text color="red">Error: {error}</Text>}
            </>
        )
    }
    if (error) return <Text color="red">Error: {error}</Text>

    return (
        <>
            <Heading>Interviews</Heading>

            <Stack direction="row" h="fit-content" separator={<StackSeparator />}>
                <Filters
                    visibleFilters={["major", "year"]}
                    selectedMajors={selectedMajors}
                    setSelectedMajors={setSelectedMajors}
                    majorOptions={majorOptions}
                    selectedYears={selectedYears}
                    setSelectedYears={setSelectedYears}
                    yearOptions={yearOptions}
                />

                <Container centerContent='true'>
                    {/* Sort Menu */}
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
                                    <Link href={`/interviews/view?id=${item.interviewId}`}>
                                        <Interview data={item} />
                                    </Link>
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
            </Stack>
        </>
    )
}