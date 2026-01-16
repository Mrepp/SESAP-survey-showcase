'use client'
import {
    Box,
    Container,
    Heading,
    Text
} from "@chakra-ui/react"
import Timeline from '@/components/Timeline'

const stuff = [{year: 2000, event: 'In a hole in the ground there lived a hobbit.'}, 
    {year: 2007, event: 'Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandyhole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.'},
    {year: 2009, event: 'It had a perfectly round door like a porthole, painted green, with a shiny yellow brass knob in the exact middle.'},
    {year: 2010, event: 'The door opened on to a tube-shaped hall like a tunnel: a very comfortable tunnel without smoke, with panelled walls, and floors tiled and carpeted, provided with polished chairs, and lots and lots of pegs for hats and coats—the hobbit was fond of visitors.'},
    {year: 2015, event: 'The tunnel wound on and on, going fairly but not quite straight into the side of the hill—The Hill, as all the people for many miles round called it—and many little round doors opened out of it, first on one side and then on another.'},
    {year: 2020, event: 'No going upstairs for the hobbit: bedrooms, bathrooms, cellars, pantries (lots of these), wardrobes (he had whole rooms devoted to clothes), kitchens, dining-rooms, all were on the same floor, and indeed on the same passage.'},
    {year: 2023, event: 'The best rooms were all on the left-hand side (going in), for these were the only ones to have windows, deep-set round windows looking over his garden, and meadows beyond, sloping down to the river.'},
]

export default function TimelinePage() {
    return (
        <>
            <Heading>Timeline</Heading>
            <Timeline data={stuff} />            
        </>
    )
}