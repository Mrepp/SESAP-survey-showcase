import {
  Box,
  Heading,
  List,
  Text
} from "@chakra-ui/react"

export default function Home() {
  return (
    <>
      <Heading size="xl" className="title">SESAP</Heading>
      
      <Heading size="lg">Planned Features</Heading>

      <List.Root ps="6">
        <List.Item>Structures Analysis Generation</List.Item>
          <List.Root ps="5">
            <List.Item>Features include Life Timeline points, which will include event descriptions and timeframe/sentiment classifications.</List.Item>
            <List.Item>Main Themes Identification such as titles, themes, and predefined categories</List.Item>
            <List.Item>Notable quotes/areas of improvement</List.Item>
          </List.Root>
        <List.Item>Human Review Interface</List.Item>
          <List.Root ps="5">
            <List.Item>This will mostly encompass user interactions in our app, such as management of submissions, editing, and status actions.</List.Item>
          </List.Root>
        <List.Item>Transcriptions Analysis Pipeline</List.Item>
          <List.Root ps="5">
            <List.Item>LLM review with text embeddings to create a highly digestible, parsable, and searchable archive of student experiences.</List.Item>
          </List.Root>
      </List.Root>

      <Heading>About</Heading>
        <Text>
          The EECS Student Experience Story Archive Project (SESAP) collects the narrative statements of students from underserved and marginalized communities. 
          Video testimonies are recorded and submitted by students in order to document their experiences in EECS programs. These are then analyzed in order to 
          highlight ways in which university and industry leaders can better support engineering students from underserved communities.
        </Text>
    </>
  );
}
