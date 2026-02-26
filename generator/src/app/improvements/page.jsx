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
import Filters from "@/components/Filters"
import ImprovementContainer from "@/components/ImprovementContainer"

// Filter value from UI (e.g. "mental-health") → same format as improvement.categories (e.g. "mental health")
function categoryFilterValueToLabel(value) {
    return value.toLowerCase().replace(/-/g, ' ')
}

function improvementMatchesCategories(improvement, selectedCategories) {
    if (!selectedCategories?.length) return true
    const selectedLabels = selectedCategories.map(categoryFilterValueToLabel)
    return improvement.categories?.some((cat) =>
        selectedLabels.includes(cat.toLowerCase())
    )
}

const improvementsList = [
    {priority: 'High', color: 'red.300', improvements: [
        {interviewId: "int_jHEHxK2ygy3e", area: 'Assessment Deadline Coordination', description: 'Implement inter‑departmental communication to stagger major assessments, preventing clustering of multiple high‑stakes deadlines within short periods.', categories: ['academic', 'diversity']},
        {interviewId: "int_jHEHxK2ygy3e", area: 'Assessment Deadline Coordination', description: 'Implement inter‑departmental communication to stagger major assessments, preventing clustering of multiple high‑stakes deadlines within short periods.', categories: ['academic', 'diversity']},
        {interviewId: "int_jHEHxK2ygy3e", area: 'Assessment Deadline Coordination', description: 'Implement inter‑departmental communication to stagger major assessments, preventing clustering of multiple high‑stakes deadlines within short periods.', categories: ['academic', 'diversity', 'extracurricular']},
        {interviewId: "int_jHEHxK2ygy3e", area: 'Assessment Deadline Coordination', description: 'Implement inter‑departmental communication to stagger major assessments, preventing clustering of multiple high‑stakes deadlines within short periods.', categories: ['academic']},
        {interviewId: "int_jHEHxK2ygy3e", area: 'Assessment Deadline Coordination', description: 'Implement inter‑departmental communication to stagger major assessments, preventing clustering of multiple high‑stakes deadlines within short periods.', categories: ['financial', 'mental health']},
        {interviewId: "int_jHEHxK2ygy3e", area: 'Assessment Deadline Coordination', description: 'Implement inter‑departmental communication to stagger major assessments, preventing clustering of multiple high‑stakes deadlines within short periods.', categories: ['other']},
    ]},
    {priority: 'Medium', color: 'orange.300', improvements: [
        {interviewId: "int_jHEHxK2ygy3e", area: 'Assessment Deadline Coordination', description: 'Implement inter‑departmental communication to stagger major assessments, preventing clustering of multiple high‑stakes deadlines within short periods.', categories: ['social', 'other']},
        {interviewId: "int_jHEHxK2ygy3e", area: 'Assessment Deadline Coordination', description: 'Implement inter‑departmental communication to stagger major assessments, preventing clustering of multiple high‑stakes deadlines within short periods.', categories: ['academic', 'diversity']},
    ]},
    {priority: 'Low', color: 'yellow.300', improvements: [
        {interviewId: "int_jHEHxK2ygy3e", area: 'Assessment Deadline Coordination', description: 'Implement inter‑departmental communication to stagger major assessments, preventing clustering of multiple high‑stakes deadlines within short periods.', categories: ['academic', 'diversity']},
        {interviewId: "int_jHEHxK2ygy3e", area: 'Assessment Deadline Coordination', description: 'Implement inter‑departmental communication to stagger major assessments, preventing clustering of multiple high‑stakes deadlines within short periods.', categories: ['academic', 'diversity']},
    ]},

]

export default function Improvements() {
    const [selectedCategories, setSelectedCategories] = useState([])

    const filteredImprovementsList = useMemo(() =>
        improvementsList.map((item) => ({
            ...item,
            improvements: item.improvements.filter((imp) =>
                improvementMatchesCategories(imp, selectedCategories)
            ),
        })).filter((item) => item.improvements.length > 0),
        [selectedCategories]
    )

    const clearAllFilters = () => {
        setSelectedCategories([])
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