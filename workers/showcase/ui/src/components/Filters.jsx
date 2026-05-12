'use client'
import {
  Accordion,
  Checkmark,
  Container,
  Listbox,
  Span,
  createListCollection,
  useListboxItemContext,
} from "@chakra-ui/react"
import { useState, useEffect, useMemo } from "react"
import { THEME_TITLES } from "@sesap/shared"
import { standardize, capitalize } from "@/app/formatFunctions"


const ListboxItemCheckmark = () => {
  const itemState = useListboxItemContext()
  return (
    <Checkmark
      filled
      size="sm"
      checked={itemState.selected}
      disabled={itemState.disabled}
    />
  )
}

const DEFAULT_YEARS = [
  { label: "2018", value: "2018" },
  { label: "2019", value: "2019" },
  { label: "2020", value: "2020" },
  { label: "2021", value: "2021" },
  { label: "2022", value: "2022" },
  { label: "2023", value: "2023" },
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
]

const DEFAULT_SENTIMENTS = [
  { label: "Positive", value: "positive" },
  { label: "Neutral", value: "neutral" },
  { label: "Negative", value: "negative" },
]

const DEFAULT_THEMES = THEME_TITLES.map((title) => ({
  label: title,
  value: title.toLowerCase(),
}))

const DEFAULT_CATEGORIES = [
  "Academic",
  "Campus Life",
  "Career",
  "Diversity",
  "Extracurricular",
  "Financial",
  "Mental Health",
  "Personal",
  "Social",
  "Other",
]

const DEFAULT_MAJORS = ["Computer Science", "Electrical and Computer Engineering"].map(
  (label) => ({ label, value: standardize(label) })
)

export const FILTER_KEYS = ["themes", "year", "sentiment", "category", "major"]

const ACCORDION_VALUES = {
  themes: "a",
  year: "b",
  sentiment: "c",
  category: "d",
  major: "e",
}

export default function Filters({
  visibleFilters = FILTER_KEYS,
  selectedThemes = [],
  setSelectedThemes,
  selectedYears = [],
  setSelectedYears,
  selectedSentiments = [],
  setSelectedSentiments,
  selectedCategories = [],
  setSelectedCategories,
  selectedMajors = [],
  setSelectedMajors = () => {},
  themeOptions,
  yearOptions,
  majorOptions,
}) {
  const [categoryItems, setCategoryItems] = useState(() =>
    DEFAULT_CATEGORIES.map((label) => ({ label, value: standardize(label) }))
  )

  // Load categories from build metadata
  useEffect(() => {
    fetch("/assets/build/metadata.json")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("metadata"))))
      .then((metadata) => {
        const raw = metadata?.categories
        if (!Array.isArray(raw) || raw.length === 0) return
        const labels = raw
          .map((c) => String(c).trim())
          .filter(Boolean)
        if (labels.length > 0) {
          setCategoryItems(
            labels.map((label) => ({
              label: capitalize(label),
              value: standardize(label),
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const categoriesCollection = useMemo(
    () => createListCollection({ items: categoryItems }),
    [categoryItems]
  )

  const themesCollection = useMemo(
    () => createListCollection({ items: themeOptions ?? DEFAULT_THEMES }),
    [themeOptions]
  )

  const yearsCollection = useMemo(
    () => createListCollection({ items: yearOptions ?? DEFAULT_YEARS }),
    [yearOptions]
  )

  const sentimentsCollection = useMemo(
    () => createListCollection({ items: DEFAULT_SENTIMENTS }),
    []
  )

  const majorsCollection = useMemo(
    () => createListCollection({ items: majorOptions ?? DEFAULT_MAJORS }),
    [majorOptions]
  )

  const defaultOpenValues = visibleFilters.map((key) => ACCORDION_VALUES[key]).filter(Boolean)

  return (
    <Container w="250px" p="0" paddingRight="10px">
      <Accordion.Root collapsible multiple defaultValue={defaultOpenValues}>

        {/* Themes */}
        {visibleFilters.includes("themes") && (
        <Accordion.Item value="a">
          <Accordion.ItemTrigger>
            <Span flex="1" color="beavOrange">
              Themes
            </Span>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>
              <Listbox.Root
                collection={themesCollection}
                selectionMode="multiple"
                value={selectedThemes}
                onValueChange={(e) => setSelectedThemes(e.value)}
              >
                <Listbox.Content>
                  {themesCollection.items.map((option) => (
                    <Listbox.Item item={option} key={option.value}>
                      <ListboxItemCheckmark />
                      <Listbox.ItemText>{option.label}</Listbox.ItemText>
                    </Listbox.Item>
                  ))}
                </Listbox.Content>
              </Listbox.Root>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
        )}

        {/* Years */}
        {visibleFilters.includes("year") && (
        <Accordion.Item value="b">
          <Accordion.ItemTrigger>
            <Span flex="1" color="beavOrange">
              Year
            </Span>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>
              <Listbox.Root
                collection={yearsCollection}
                selectionMode="multiple"
                value={selectedYears}
                onValueChange={(e) => setSelectedYears(e.value)}
              >
                <Listbox.Content>
                  {yearsCollection.items.map((option) => (
                    <Listbox.Item item={option} key={option.value}>
                      <ListboxItemCheckmark />
                      <Listbox.ItemText>{option.label}</Listbox.ItemText>
                    </Listbox.Item>
                  ))}
                </Listbox.Content>
              </Listbox.Root>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
        )}

        {/* Sentiments */}
        {visibleFilters.includes("sentiment") && (
        <Accordion.Item value="c">
          <Accordion.ItemTrigger>
            <Span flex="1" color="beavOrange">
              Sentiment
            </Span>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>
              <Listbox.Root
                collection={sentimentsCollection}
                selectionMode="multiple"
                value={selectedSentiments}
                onValueChange={(e) => setSelectedSentiments(e.value)}
              >
                <Listbox.Content>
                  {sentimentsCollection.items.map((option) => (
                    <Listbox.Item item={option} key={option.value}>
                      <ListboxItemCheckmark />
                      <Listbox.ItemText>{option.label}</Listbox.ItemText>
                    </Listbox.Item>
                  ))}
                </Listbox.Content>
              </Listbox.Root>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
        )}

        {/* Categories (from metadata.json) */}
        {visibleFilters.includes("category") && (
        <Accordion.Item value="d">
          <Accordion.ItemTrigger>
            <Span flex="1" color="beavOrange">
              Category
            </Span>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>
              <Listbox.Root
                collection={categoriesCollection}
                selectionMode="multiple"
                value={selectedCategories}
                onValueChange={(e) => setSelectedCategories(e.value)}
              >
                <Listbox.Content>
                  {categoriesCollection.items.map((option) => (
                    <Listbox.Item item={option} key={option.value}>
                      <ListboxItemCheckmark />
                      <Listbox.ItemText>{option.label}</Listbox.ItemText>
                    </Listbox.Item>
                  ))}
                </Listbox.Content>
              </Listbox.Root>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
        )}

        {/* Major */}
        {visibleFilters.includes("major") && (
        <Accordion.Item value="e">
          <Accordion.ItemTrigger>
            <Span flex="1" color="beavOrange">
              Major
            </Span>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>
              <Listbox.Root
                collection={majorsCollection}
                selectionMode="multiple"
                value={selectedMajors}
                onValueChange={(e) => setSelectedMajors(e.value)}
              >
                <Listbox.Content>
                  {majorsCollection.items.map((option) => (
                    <Listbox.Item item={option} key={option.value}>
                      <ListboxItemCheckmark />
                      <Listbox.ItemText>{option.label}</Listbox.ItemText>
                    </Listbox.Item>
                  ))}
                </Listbox.Content>
              </Listbox.Root>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
        )}

      </Accordion.Root>
    </Container>
  )
}
