'use client'
import {
    Box,
    CloseButton,
    Dialog,
    Grid,
    Heading,
    Portal,
    Text,
} from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { useDataLoader } from '@/hooks/useDataLoader'
import { buildBubbleData, buildWordCloudText, buildThemeCorrelations, buildBarChartData, buildMajorDoughnutChartData } from '@/app/buildFunctions'
import BarChart, { barChartMeta } from '@/components/visualizations/BarChart'
import BubbleChart, { bubbleChartMeta } from "@/components/visualizations/BubbleChart"
import Correlation, { correlationHeatMapMeta } from '@/components/visualizations/CorrelationHeatMap'
import MajorDoughnutChart, { majorDoughnutChartMeta } from '@/components/visualizations/MajorDoughnutChart'
import WordCloud, { wordCloudMeta } from "@/components/visualizations/WordCloud"


const INSIGHT_KEYS = {
    wordCloud: 'wordCloud',
    correlation: 'correlation',
    bubble: 'bubble',
    bar: 'bar',
    majorDoughnutChart: 'majorDoughnutChart',
}

function insightCardProps(enabled, insightKey, setDialogKey) {
    if (!enabled) return {}
    return {
        role: 'button',
        tabIndex: 0,
        cursor: 'pointer',
        onClick: () => setDialogKey(insightKey),
        onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setDialogKey(insightKey)
            }
        },
    }
}

export default function Insights() {
    const { isReady, data, error, statusText } = useDataLoader()
    const [dialogKey, setDialogKey] = useState(null)

    const themes = useMemo(() => buildBubbleData(data?.interviews), [data?.interviews])
    const text = useMemo(() => buildWordCloudText(data?.interviews), [data?.interviews])
    const correlations = useMemo(() => buildThemeCorrelations(data?.interviews), [data?.interviews])
    const interviewData = useMemo(() => buildBarChartData(data?.interviews), [data?.interviews])
    const majorDoughnutChartData = useMemo(() => buildMajorDoughnutChartData(data?.interviews), [data?.interviews])

    const dialogMeta =
        dialogKey === INSIGHT_KEYS.wordCloud ? wordCloudMeta
        : dialogKey === INSIGHT_KEYS.correlation ? correlationHeatMapMeta
        : dialogKey === INSIGHT_KEYS.bubble ? bubbleChartMeta
        : dialogKey === INSIGHT_KEYS.bar ? barChartMeta
        : dialogKey === INSIGHT_KEYS.majorDoughnutChart ? majorDoughnutChartMeta
        : null

    if (!isReady) {
        return (
            <>
                <Heading>Insights</Heading>
                <Text>{statusText}</Text>
                {error != null && <Text color="red">Error: {error}</Text>}
            </>
        )
    }
    if (error) {
        return (
            <>
                <Heading>Insights</Heading>
                <Text color="red">Error: {error}</Text>
            </>
        )
    }

    return (
        <>
            <Heading mb={4}>Insights</Heading>
            <Text marginBottom='15px'>Click a data visualization for an expanded version and short description.</Text>
            <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                templateRows={{ base: "repeat(4, 1fr)", md: "auto auto auto" }}
                gap={5}
                minH={{ base: "800px", md: "500px" }}
            >
                <Box
                    bg="white"
                    borderWidth="1px"
                    borderRadius="25px"
                    h='300px'
                    minH={0}
                    overflow="hidden"
                    p={4}
                    {...insightCardProps(!!text, INSIGHT_KEYS.wordCloud, setDialogKey)}
                >
                    {text ? <WordCloud text={text} interviews={data?.interviews} /> : <Text color="fg.muted">No interview text available.</Text>}
                </Box>
                <Box
                    bg="white"
                    borderWidth="1px"
                    borderRadius="25px"
                    h='300px'
                    minH={0}
                    overflow="auto"
                    p={4}
                    {...insightCardProps(correlations.length > 0, INSIGHT_KEYS.correlation, setDialogKey)}
                >
                    {correlations.length > 0
                        ? <Correlation correlations={correlations} />
                        : <Text color="fg.muted">Not enough data for a correlation map (need at least two themes across interviews).</Text>
                    }
                </Box>
                <Box
                    display="flex"
                    flexDirection={{ base: "column", md: "row" }}
                    gap={5}
                    minH={0}
                    minW={0}
                    h={{ base: "auto", md: "300px" }}
                >
                    <Box
                        flex={{ md: "1 1 0" }}
                        minW={0}
                        bg="white"
                        borderWidth="1px"
                        borderRadius="25px"
                        h={{ base: "300px", md: "100%" }}
                        minH={0}
                        overflow="hidden"
                        p={4}
                        {...insightCardProps(themes.length > 0, INSIGHT_KEYS.bubble, setDialogKey)}
                    >
                        {themes.length > 0 ? <BubbleChart data={themes} /> : <Text color="fg.muted">No theme data available.</Text>}
                    </Box>
                    <Box
                        flex={{ md: "1 1 0" }}
                        display="flex"
                        justifyContent="center"
                        minW={0}
                        bg="white"
                        borderWidth="1px"
                        borderRadius="25px"
                        h={{ base: "300px", md: "100%" }}
                        minH={0}
                        overflow="hidden"
                        p={4}
                        {...insightCardProps(majorDoughnutChartData.length > 0, INSIGHT_KEYS.majorDoughnutChart, setDialogKey)}
                    >
                        {majorDoughnutChartData.length > 0 ? <MajorDoughnutChart majorData={majorDoughnutChartData} /> : <Text color="fg.muted">No major data available.</Text>}
                    </Box>
                </Box>
                <Box
                    bg="white"
                    borderWidth="1px"
                    borderRadius="25px"
                    h='300px'
                    minH={0}
                    overflow="hidden"
                    p={4}
                    {...insightCardProps(interviewData.length > 0, INSIGHT_KEYS.bar, setDialogKey)}
                >
                    {interviewData.length > 0
                        ? <BarChart interviewData={interviewData} />
                        : <Text color="fg.muted">No demographic data available.</Text>
                    }
                </Box>
            </Grid>

            <Dialog.Root
                open={dialogKey != null}
                onOpenChange={(e) => {
                    if (!e.open) setDialogKey(null)
                }}
                size="cover"
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content maxW="min(96vw, 1100px)" w="full" >
                            <Dialog.Header paddingBottom='0'>
                                <Dialog.Title>{dialogMeta?.title}</Dialog.Title>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body h='100%' overflow='auto'>
                                {dialogMeta && (
                                    <Text mb={4} fontSize="md">
                                        {dialogMeta.description}
                                    </Text>
                                )}
                                <Box w="full" minH={{ base: "320px", md: "420px" }} maxH="75vh" >
                                    {dialogKey === INSIGHT_KEYS.wordCloud && text ? (
                                        <WordCloud text={text} interviews={data?.interviews} width={960} height={540} />
                                    ) : null}
                                    {dialogKey === INSIGHT_KEYS.correlation && correlations.length > 0 ? (
                                        <Box display="flex" justifyContent="center" alignItems="center" >
                                            <Correlation correlations={correlations} plotWidth={960} />
                                        </Box>
                                    ) : null}
                                    {dialogKey === INSIGHT_KEYS.bubble && themes.length > 0 ? (
                                        <Box display="flex" justifyContent="center" alignItems="center" minH="min(70vh, 900px)">
                                            <BubbleChart data={themes} width={880} height={880} />
                                        </Box>
                                    ) : null}
                                    {dialogKey === INSIGHT_KEYS.majorDoughnutChart && majorDoughnutChartData.length > 0 ? (
                                        <Box display="flex" justifyContent="center" alignItems="center" minH="min(70vh, 900px)" >
                                            <MajorDoughnutChart majorData={majorDoughnutChartData} width={700} height={500} showLegend />
                                        </Box>
                                    ) : null}
                                    {dialogKey === INSIGHT_KEYS.bar && interviewData.length > 0 ? (
                                        <Box w="100%" h="min(68vh, 720px)" minH="380px">
                                            <BarChart interviewData={interviewData} showLegend />
                                        </Box>
                                    ) : null}
                                </Box>
                            </Dialog.Body>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    )
}
