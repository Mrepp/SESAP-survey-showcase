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
import Filters from "@/components/Filters"
import ThemeCard from "@/components/ThemeCard"

const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }

function formatDate(value) {
    if (!value) return ''
    const d = typeof value === 'string' ? new Date(value) : value
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, dateOptions)
}

function buildThemesFromInterviews(interviews) {
    if (!Array.isArray(interviews)) return []
    const themeMap = new Map()

    for (const iv of interviews) {
        const themes = iv.analysis?.themes
        if (!Array.isArray(themes)) continue

        for (const t of themes) {
            const title = t.title
            if (!title) continue

            if (!themeMap.has(title)) {
                themeMap.set(title, { frequencies: [], category: t.category, interviews: [] })
            }
            const entry = themeMap.get(title)
            entry.frequencies.push(Number(t.frequency ?? 0) || 0)
            if (t.category) entry.category = t.category
            entry.interviews.push({
                interviewId: iv.id,
                videoUrl: iv.videoUrl ?? '/placeholder16x9.jpg',
                videoAlt: `${iv.title ?? iv.id} interview`,
                name: iv.title ?? 'Interviewee Name',
                date: formatDate(iv.metadata?.interviewDate),
                description: '',
            })
        }
    }

    return Array.from(themeMap.entries()).map(([title, entry]) => ({
        theme: title,
        impactScore: entry.frequencies.length > 0
            ? String(Math.round(entry.frequencies.reduce((a, b) => a + b, 0) / entry.frequencies.length))
            : '0',
        frequency: String(entry.interviews.length),
        category: entry.category ?? 'other',
        interviews: entry.interviews,
    }))
}

export default function Themes() {
    const { isReady, data, error, statusText } = useDataLoader()
    const [sortBy, setSortBy] = useState('impact-desc')

    const themes = useMemo(() => buildThemesFromInterviews(data?.interviews), [data?.interviews])

    // Sort data based on selected option
    const sortedThemes = useMemo(() => {
        const sorted = [...themes]
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
    }, [sortBy, themes])

    // Filter states
    const [selectedCategories, setSelectedCategories] = useState([])

    const clearAllFilters = () => {
        setSelectedCategories([])
    }

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
