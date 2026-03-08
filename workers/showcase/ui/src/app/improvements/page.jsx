'use client'
import {
    Box,
    Button,
    Container,
    Heading,
    Stack,
    StackSeparator,
    Text,
} from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { useDataLoader } from '@/hooks/useDataLoader'
import Filters from "@/components/Filters"
import ImprovementContainer from "@/components/ImprovementContainer"

const PRIORITY_GROUPS = [
    { priority: 'High', color: 'red.300', key: 'high' },
    { priority: 'Medium', color: 'orange.300', key: 'medium' },
    { priority: 'Low', color: 'yellow.300', key: 'low' },
]

// Normalize category to comparable label: lowercase, underscores and hyphens → spaces
// (e.g. 'campus_life' or 'mental-health' → 'campus life' / 'mental health')
function toCategoryLabel(value) {
    return String(value ?? '').toLowerCase().replace(/[_-]/g, ' ')
}

function improvementMatchesCategories(improvement, selectedCategories) {
    if (!selectedCategories?.length) return true
    const selectedLabels = selectedCategories.map(toCategoryLabel)
    const categories = improvement.categories
    const list = Array.isArray(categories) ? categories : categories != null ? [String(categories)] : []
    return list.some((cat) => selectedLabels.includes(toCategoryLabel(cat)))
}

// Build improvements from useDataLoader interviews (analysis.areasForImprovement)
function buildImprovementsFromInterviews(interviews) {
    if (!Array.isArray(interviews)) return []
    const list = []
    for (const iv of interviews) {
        const interviewId = iv.id
        const areas = iv.analysis.areasForImprovement
        if (!Array.isArray(areas)) continue
        for (const a of areas) {
            list.push({
                interviewId,
                area: String(a.area ?? ''),
                description: String(a.description ?? ''),
                categories: toCategoryLabel(a.category ?? 'other'),
                priority: String(a.priority ?? 'medium').toLowerCase(),
            })
        }
    }
    return list
}

// Group flat improvements by priority into the shape expected by ImprovementContainer
function groupByPriority(improvements) {
    const priorityKey = { high: [], medium: [], low: [] }
    for (const imp of improvements) {
        const key = imp.priority === 'high' ? 'high' : imp.priority === 'low' ? 'low' : 'medium'
        priorityKey[key].push(imp)
    }
    return PRIORITY_GROUPS.map(({ priority, color, key }) => ({
        priority,
        color,
        improvements: priorityKey[key],
    }))
}

export default function Improvements() {
    const { progress, statusText, error, isReady, data } = useDataLoader()
    const [selectedCategories, setSelectedCategories] = useState([])

    const improvementsList = useMemo(() => {
        const raw = buildImprovementsFromInterviews(data?.interviews)
        return groupByPriority(raw)
    }, [data?.interviews])

    const filteredImprovementsList = useMemo(() =>
        improvementsList.map((item) => ({
            ...item,
            improvements: item.improvements.filter((imp) =>
                improvementMatchesCategories(imp, selectedCategories)
            ),
        })).filter((item) => item.improvements.length > 0),
        [improvementsList, selectedCategories]
    )

    const clearAllFilters = () => {
        setSelectedCategories([])
    }

    if (!isReady) {
        return (
            <>
                <Heading>Improvement Dashboard</Heading>
                <Text>{statusText}</Text>
                {error != null && <Text color="red">Error: {error}</Text>}
            </>
        )
    }
    if (error) {
        return (
            <>
                <Heading>Improvement Dashboard</Heading>
                <Text color="red">Error: {error}</Text>
            </>
        )
    }

    return (
        <>
            <Heading>Improvement Dashboard</Heading>
            <Stack direction="row" h="fit-content" separator={<StackSeparator />}>
            
                <Filters
                    visibleFilters={["category"]}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                />

                {/* Results */}
                <Container paddingRight='0'>

                    {/* Description and Clear Button */}
                    <Box marginBottom='20px' display='flex' justifyContent='space-between' alignItems='center'>
                        <Button variant='surface' onClick={clearAllFilters}>Clear Filter</Button>
                    </Box>

                    <Box>
                        {filteredImprovementsList.map((item, index) => (
                            <ImprovementContainer key={index} priority={item.priority} color={item.color} improvements={item.improvements} />
                        ))}
                    </Box>
                </Container>

            </Stack>

        </>
    )
}