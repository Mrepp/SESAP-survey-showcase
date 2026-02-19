"use client"
import {Button, Group, Input, Text} from "@chakra-ui/react"


export default function SearchBar ({placeholder = 'Search interviews'}) {
    return (
        <Group attached w="full">
            <Input bg='white' flex="1" placeholder={placeholder} />
            <Button variant="outline">
                <Text color='beavOrange' fontSize='lg' >Search</Text>
            </Button>
        </Group>
    )
}
