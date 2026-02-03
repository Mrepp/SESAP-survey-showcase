"use client"
import {Button, Group, Input, Text} from "@chakra-ui/react"


export default function SearchBar () {
    return (
        <Group attached w="full">
            <Input bg='white' flex="1" placeholder="Search interviews" />
            <Button variant="outline">
                <Text color='beavOrange' fontSize='lg' >Search</Text>
            </Button>
        </Group>
    )
}
