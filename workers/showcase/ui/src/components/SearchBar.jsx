"use client"
import { Button, Group, Input, Text } from "@chakra-ui/react"

export default function SearchBar({
    value = '',
    onChange,
    onSearch,
    isSearching = false,
    placeholder = 'Search interviews',
}) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') onSearch?.()
    }

    return (
        <Group attached w="full">
            <Input
                bg="white"
                flex="1"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <Button
                variant="outline"
                onClick={onSearch}
                disabled={isSearching || !value?.trim()}
            >
                <Text color="beavOrange" fontSize="lg">
                    {isSearching ? 'Searching...' : 'Search'}
                </Text>
            </Button>
        </Group>
    )
}
