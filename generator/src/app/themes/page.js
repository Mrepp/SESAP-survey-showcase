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
} from "@chakra-ui/react"
import { useState, useMemo } from "react"
import ThemeCard from "@/components/ThemeCard"

export default function Themes() {
    const [sortBy, setSortBy] = useState('impact-desc') // 'impact-desc', 'impact-asc', 'frequency-desc', 'frequency-asc', 'name-asc', 'name-desc'

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
    }, [sortBy])

    return (
        <>
            <Heading>Themes</Heading>

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
        </>
    )
}

const themes = [{theme: 'Academic Difficulty', impactScore: '1', frequency: '9', interviews: [
    {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
    {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
    {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
]},
        {theme: 'Faculty Support', impactScore: '2', frequency: '8', interviews: [
            {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
            {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
            {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
        ]},
        {theme: 'Peer Relationships', impactScore: '2', frequency: '7', interviews: [
            {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
            {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
            {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
        ]},
        {theme: 'Belonging', impactScore: '3', frequency: '6', interviews: [
            {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
            {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
            {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
        ]},
        {theme: 'Cultural Representation', impactScore: '4', frequency: '6', interviews: [
            {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
            {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
            {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
        ]},
        {theme: 'Financial Struggles', impactScore: '5', frequency: '5', interviews: [
            {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
            {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
            {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
        ]},
        {theme: 'Mental Health', impactScore: '5', frequency: '4', interviews: [
            {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
            {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
            {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
        ]},
        {theme: 'Family Pressure', impactScore: '6', frequency: '3', interviews: [
            {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
            {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
            {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
        ]},
        {theme: 'Work-Life Balance', impactScore: '1', frequency: '2', interviews: [
            {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
            {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
            {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
        ]},
        {theme: 'Identity & Discrimination', impactScore: '2', frequency: '3', interviews: [
            {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
            {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
            {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
        ]},
        {theme: 'Career Preparation', impactScore: '9', frequency: '4', interviews: [
            {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
            {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
            {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
        ]},
        {theme: 'Language Barriers', impactScore: '8', frequency: '1', interviews: [
            {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
            {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
            {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
        ]},
        {theme: 'Support Networks', impactScore: '8', frequency: '1', interviews: [
            {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
            {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
            {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
        ]},
        {theme: 'Personal Growth', impactScore: '7', frequency: '2', interviews: [
            {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
            {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: ""},
            {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: ""},
        ]},
]
