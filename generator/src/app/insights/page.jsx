'use client'
import {
    Box,
    Flex,
    Heading,
    Stack,
    Text,
} from "@chakra-ui/react"
import BarChart from '@/components/visualizations/BarChart'
import BubbleChart from "@/components/visualizations/BubbleChart"
import Correlation from '@/components/visualizations/CorrelationHeatMap'
import WordCloud from "@/components/visualizations/WordCloud"

export default function Insights() {
    return (
        <>
            
            {/*<Box bg='white' w='fill' h='300px' marginTop='-30px' marginLeft='-30px' marginRight='-30px' >
                <WordCloud/>
            </Box>*/}
            <Stack direction={{ base: "column", md: "row" }} h='100vh' gap='20px'>
                <Stack w='40%' h='100%' gap='20px'>
                    <Box bg='white' w='100%'  borderWidth="1px" borderRadius='25px'>
                        <WordCloud text={text} />
                    </Box>

                    <Box bg='white'   borderWidth="1px" borderRadius='25px' p='15px'>
                        <BubbleChart  data={themes}/>
                    </Box>
                </Stack>
                
                <Stack h='100%' gap='20px'>
                    <Box w='fit-content' h='fit-content' bg='white' borderWidth="1px" borderRadius='25px' paddingLeft='20px' paddingTop='20px' paddingBottom='20px'>
                        <Correlation correlations={correlations}/>
                    </Box>

                    <Box minH='300px' h='fit-content' bg='white' padding='20px' borderWidth="1px" borderRadius='25px'>
                        <BarChart interviewData={interviewData}/>
                    </Box>
                </Stack>
            </Stack>
        </>
    )
}

const themes = [
    {"title": "Academic Difficulty", "impactScore": 10, "category": "cat3",},
    {"title": "Belonging", "impactScore": 5, "category": "cat2",},
    {"title": "Career Preparation", "impactScore": 7, "category": "cat1",},
    {"title": "Cultural Representation", "impactScore": 8, "category": "cat2",},
    {"title": "Faculty Support", "impactScore": 10, "category": "cat1",},
    {"title": "Family Pressure", "impactScore": 5, "category": "cat2",},
    {"title": "Financial Struggles", "impactScore": 7, "category": "cat1",},
    {"title": "Identity & Discrimination", "impactScore": 1, "category": "cat2",},
    {"title": "Mental Health", "impactScore": 10, "category": "cat1",},
    {"title": "Language Barriers", "impactScore": 5, "category": "cat2",},
    {"title": "Peer Relationships", "impactScore": 3, "category": "cat1",},
    {"title": "Personal Growth", "impactScore": 7, "category": "cat2",},
    {"title": "Support Networks", "impactScore": 2, "category": "cat1",},
    {"title": "Work-Life Balance", "impactScore": 1, "category": "cat3",},
]

const text = `In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole,
filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy
hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and
that means comfort.
It had a perfectly round door like a porthole, painted green, with a
shiny yellow brass knob in the exact middle. The door opened on to a tube-
shaped hall like a tunnel: a very comfortable tunnel without smoke, with
panelled walls, and floors tiled and carpeted, provided with polished
chairs, and lots and lots of pegs for hats and coats—the hobbit was fond of
visitors. The tunnel wound on and on, going fairly but not quite straight
into the side of the hill—The Hill, as all the people for many miles round
called it—and many little round doors opened out of it, first on one side
and then on another. No going upstairs for the hobbit: bedrooms,
bathrooms, cellars, pantries (lots of these), wardrobes (he had whole
rooms devoted to clothes), kitchens, dining-rooms, all were on the same
floor, and indeed on the same passage. The best rooms were all on the left-
hand side (going in), for these were the only ones to have windows, deep-
set round windows looking over his garden, and meadows beyond, sloping
down to the river.
This hobbit was a very well-to-do hobbit, and his name was Baggins.
The Bagginses had lived in the neighbourhood of The Hill for time out of
mind, and people considered them very respectable, not only because most
of them were rich, but also because they never had any adventures or did
anything unexpected: you could tell what a Baggins would say on any
question without the bother of asking him. This is a story of how a
Baggins had an adventure, and found himself doing and saying things
altogether unexpected. He may have lost the neighbours’ respect, but he
gained—well, you will see whether he gained anything in the end.
The mother of our particular hobbit—what is a hobbit? I suppose
hobbits need some description nowadays, since they have become rare and
shy of the Big People, as they call us. They are (or were) a little people,
about half our height, and smaller than the bearded Dwarves. Hobbits have
no beards. There is little or no magic about them, except the ordinary
everyday sort which helps them to disappear quietly and quickly when
large stupid folk like you and me come blundering along, making a noise
like elephants which they can hear a mile off. They are inclined to be fat in
the stomach; they dress in bright colours (chiefly green and yellow); wear
no shoes, because their feet grow natural leathery soles and thick warm
brown hair like the stuff on their heads (which is curly); have long clever
brown fingers, good-natured faces, and laugh deep fruity laughs
(especially after dinner, which they have twice a day when they can get it).
Now you know enough to go on with. As I was saying, the mother of this
hobbit—of Bilbo Baggins, that is—was the famous Belladonna Took, one
of the three remarkable daughters of the Old Took, head of the hobbits who
lived across The Water, the small river that ran at the foot of The Hill. It
was often said (in other families) that long ago one of the Took ancestors
must have taken a fairy wife. That was, of course, absurd, but certainly
there was still something not entirely hobbitlike about them, and once in a
while members of the Took-clan would go and have adventures. They
discreetly disappeared, and the family hushed it up; but the fact remained
that the Tooks were not as respectable as the Bagginses, though they were
undoubtedly richer.`

const correlations = [
  {a: "culmen_length_mm", b: "culmen_length_mm", correlation: 1},
  {a: "culmen_length_mm", b: "culmen_depth_mm", correlation: -0.2350528703555326},
  {a: "culmen_length_mm", b: "flipper_length_mm", correlation: 0.6561813407464275},
  {a: "culmen_length_mm", b: "body_mass_g", correlation: 0.5951098244376305},
  {a: "culmen_depth_mm", b: "culmen_length_mm", correlation: -0.2350528703555326},
  {a: "culmen_depth_mm", b: "culmen_depth_mm", correlation: 1},
  {a: "culmen_depth_mm", b: "flipper_length_mm", correlation: -0.5838512164654125},
  {a: "culmen_depth_mm", b: "body_mass_g", correlation: -0.4719156211860666},
  {a: "flipper_length_mm", b: "culmen_length_mm", correlation: 0.6561813407464275},
  {a: "flipper_length_mm", b: "culmen_depth_mm", correlation: -0.5838512164654125},
  {a: "flipper_length_mm", b: "flipper_length_mm", correlation: 1},
  {a: "flipper_length_mm", b: "body_mass_g", correlation: 0.8712017673060116},
  {a: "body_mass_g", b: "culmen_length_mm", correlation: 0.5951098244376305},
  {a: "body_mass_g", b: "culmen_depth_mm", correlation: -0.4719156211860666},
  {a: "body_mass_g", b: "flipper_length_mm", correlation: 0.8712017673060116},
  {a: "body_mass_g", b: "body_mass_g", correlation: 1},
]

const interviewData = [{theme: 'Academic Difficulty', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Belonging', identities: {Disabled: 13, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Career Preparation', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Cultural Representation', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Faculty Support', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Family Pressure', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Financial Struggles', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Identity & Discrimination', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Mental Health', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Language Barriers', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 5, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Peer Relationships', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Personal Growth', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Support Networks', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Work-Life Balance', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
]