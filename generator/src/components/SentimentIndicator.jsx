'use client'
import {
    Badge,
    Box,
    HoverCard,
    Portal,
} from "@chakra-ui/react"
import { FaPlus, FaPlusMinus, FaMinus, FaEquals } from "react-icons/fa6"

const sentimentConfig = {
    positive: { Icon: FaPlus, colorPalette: 'green' },
    mixed: { Icon: FaPlusMinus, colorPalette: 'yellow' },
    negative: { Icon: FaMinus, colorPalette: 'red' },
    neutral: { Icon: FaEquals, colorPalette: 'gray' },
}

export default function SentimentIndicator({ sentiment }) {
    const { Icon, colorPalette } = sentimentConfig[sentiment] ?? sentimentConfig.mixed
    return (
        <HoverCard.Root size="sm" openDelay={0} closeDelay={100} positioning={{ placement: "left" }}>
            <HoverCard.Trigger asChild>
                <Badge colorPalette={colorPalette} variant="surface">
                    <Icon />
                </Badge>
            </HoverCard.Trigger>
            <Portal>
                <HoverCard.Positioner>
                    <HoverCard.Content maxWidth="240px">
                        <HoverCard.Arrow />
                        <Box>
                            {sentiment} sentiment
                        </Box>
                    </HoverCard.Content>
                </HoverCard.Positioner>
            </Portal>
        </HoverCard.Root>
    )
}