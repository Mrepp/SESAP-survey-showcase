'use client'
import {
    Container,
    Heading,
    Text
} from "@chakra-ui/react"
import SearchBar from "@/components/SearchBar"

export default function Search() {
    return (
        <>
            <Heading>Search</Heading>
            <SearchBar/>
        </>
    )
}