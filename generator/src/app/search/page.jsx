'use client'
import {
    Box,
    Button,
    Container,
    GridItem,
    Stack,
    StackSeparator,
    Text,
} from "@chakra-ui/react"
import { useState } from "react"
import SearchBar from "@/components/SearchBar"
import Result from '@/components/ResultsCard'
import Filters from '@/components/Filters'

export default function Search() {
    const [selectedThemes, setSelectedThemes] = useState([])
    const [selectedYears, setSelectedYears] = useState([])
    const [selectedSentiments, setSelectedSentiments] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([])

    const clearAllFilters = () => {
        setSelectedThemes([])
        setSelectedYears([])
        setSelectedSentiments([])
        setSelectedCategories([])
    }

    return (
        <>
            <Box marginBottom='50px' >
                <SearchBar/>
            </Box>

            <Stack direction="row" h="fit-content" separator={<StackSeparator />}>

                <Filters
                    selectedThemes={selectedThemes}
                    setSelectedThemes={setSelectedThemes}
                    selectedYears={selectedYears}
                    setSelectedYears={setSelectedYears}
                    selectedSentiments={selectedSentiments}
                    setSelectedSentiments={setSelectedSentiments}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                />

                {/* Results */}
                <Container paddingRight='0'>

                    {/* Description and Clear Button */}
                    <Box marginBottom='20px' display='flex' justifyContent='space-between' alignItems='center'>
                        <Text>{results.length} Results for </Text>
                        <Button variant='surface' onClick={clearAllFilters}>Clear Filter</Button>
                    </Box>

                    {/* Result Items */}
                    <Box>
                        {results.map((item, index) => (
                            <GridItem key={index} 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            paddingBottom='15px'
                            >
                                <Result data={item} />
                            </GridItem>
                        ))}
                    </Box>
                </Container>

            </Stack>
        </>
    )
}



const results = [
    {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '3', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2022-03-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '4', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2023-03-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '5', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2023-04-30', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '6', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-05-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '7', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2025-05-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '8', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-05-25', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '9', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '10', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2023-03-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
]