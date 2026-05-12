'use client'
import {
    Box,
    Button,
    Container,
    Grid,
    GridItem,
    Heading,
    Menu,
    Portal,
    Stack,
    StackSeparator,
    Text,
} from "@chakra-ui/react"
import { useState, useMemo } from "react"
import { useDataLoader } from '@/hooks/useDataLoader'
import { standardize } from '@/app/formatFunctions'
import { buildThemesFromInterviews } from '@/app/buildFunctions'
import Filters from "@/components/Filters"
import ThemeCard from "@/components/ThemeCard"


export default function Themes() {
    const { isReady, data, error, statusText } = useDataLoader()
    const [sortBy, setSortBy] = useState('impact-desc')

    const themes = useMemo(() => buildThemesFromInterviews(data?.interviews), [data?.interviews])

    // Filter states
    const [selectedCategories, setSelectedCategories] = useState([])

    const filteredThemes = useMemo(() => {
        if (!selectedCategories.length) return themes
        const selected = new Set(selectedCategories)
        return themes.filter((t) => selected.has(standardize(t.category) || 'other'))
    }, [themes, selectedCategories])

    // Sort data based on selected option
    const sortedThemes = useMemo(() => {
        const sorted = [...filteredThemes]
        if (sortBy === 'impact-desc') {
            sorted.sort((a, b) => parseInt(b.impactScore) - parseInt(a.impactScore))
        } else if (sortBy === 'impact-asc') {
            sorted.sort((a, b) => parseInt(a.impactScore) - parseInt(b.impactScore))
        } else if (sortBy === 'frequency-desc') {
            sorted.sort((a, b) => parseInt(b.frequency) - parseInt(a.frequency))
        } else if (sortBy === 'frequency-asc') {
            sorted.sort((a, b) => parseInt(a.frequency) - parseInt(b.frequency))
        } else if (sortBy === 'name-asc') {
            sorted.sort((a, b) => a.theme.localeCompare(b.theme))
        } else if (sortBy === 'name-desc') {
            sorted.sort((a, b) => b.theme.localeCompare(a.theme))
        }
        return sorted
    }, [sortBy, filteredThemes])

    if (!isReady) {
        return (
            <>
                <Heading>Themes</Heading>
                <Text>{statusText}</Text>
                {error != null && <Text color="red">Error: {error}</Text>}
            </>
        )
    }
    if (error) {
        return (
            <>
                <Heading>Themes</Heading>
                <Text color="red">Error: {error}</Text>
            </>
        )
    }

    return (
        <>
            <Box marginBottom='40px'>
                <Heading>Themes</Heading>
                <Text>Click on any theme to see related interviews.</Text>
            </Box>

            <Stack direction="row" h="fit-content" separator={<StackSeparator />}>
                <Filters
                    visibleFilters={["category"]}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                />

                {/* Sort Menu */}
                <Container centerContent='true'>
                    <Box alignSelf='flex-end'>
                        <Menu.Root mb={4}>
                            <Menu.Trigger asChild>
                                <Button variant="outline">
                                    Sort by: {
                                        sortBy === 'impact-desc' ? 'Impact Score (High to Low)' :
                                        sortBy === 'impact-asc' ? 'Impact Score (Low to High)' :
                                        sortBy === 'frequency-desc' ? 'Frequency (High to Low)' :
                                        sortBy === 'frequency-asc' ? 'Frequency (Low to High)' :
                                        sortBy === 'name-asc' ? 'Name (A to Z)' :
                                        'Name (Z to A)'
                                    }
                                </Button>
                            </Menu.Trigger>

                            <Portal>
                                <Menu.Positioner>
                                    <Menu.Content>
                                        <Menu.Item
                                            onClick={() => {setSortBy('impact-desc')}}
                                        >
                                            Impact Score (High to Low)
                                        </Menu.Item>
                                        <Menu.Item
                                            onClick={() => {setSortBy('impact-asc')}}
                                        >
                                            Impact Score (Low to High)
                                        </Menu.Item>

                                        {/* Frequency */}
                                        <Menu.Item
                                            onClick={() => {setSortBy('frequency-desc')}}
                                        >
                                            Frequency (High to Low)
                                        </Menu.Item>
                                        <Menu.Item
                                            onClick={() => {setSortBy('frequency-asc')}}
                                        >
                                            Frequency (Low to High)
                                        </Menu.Item>

                                        {/* Name */}
                                        <Menu.Item
                                            onClick={() => {setSortBy('name-asc')}}
                                        >
                                            Name (A to Z)
                                        </Menu.Item>
                                        <Menu.Item
                                            onClick={() => {setSortBy('name-desc')}}
                                        >
                                            Name (Z to A)
                                        </Menu.Item>
                                    </Menu.Content>
                                </Menu.Positioner>
                            </Portal>
                        </Menu.Root>
                    </Box>

                    <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" w='100%' >
                        {sortedThemes.map((item, index) => (
                            <GridItem key={index}
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            padding='30px'
                            w='100%'>
                                <ThemeCard data={item} />
                            </GridItem>
                        ))}
                    </Grid>
                </Container>
            </Stack>
        </>
    )
}
