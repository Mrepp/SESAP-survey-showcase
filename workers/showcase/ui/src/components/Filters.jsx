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

const years = createListCollection({
  items: [
    { label: "2000-2004", value: "react" },
    { label: "2005-2009", value: "vue" },
    { label: "2010-2014", value: "angular" },
    { label: "2015-2019", value: "svelte" },
    { label: "2020-2024", value: "nextjs" },
    { label: "2025-2029", value: "nuxtjs" },
  ],
})

const sentiments = createListCollection({
  items: [
    { label: "Positive", value: "positive" },
    { label: "Neutral", value: "neutral" },
    { label: "Negative", value: "negative" },
  ],
})

const themes = createListCollection({
  items: [
    { label: "Academic Difficulty", value: "academic difficulty" },
    { label: "Faculty Support", value: "faculty support" },
    { label: "Peer Relationships", value: "peer relationships" },
    { label: "Belonging", value: "belonging" },
    { label: "Cultural Representation", value: "cultural representation" },
    { label: "Financial Struggles", value: "financial struggles" },
    { label: "Mental Health", value: "mental health" },
    { label: "Family Pressure", value: "family pressure" },
    { label: "Work-Life Balance", value: "work-life balance" },
    { label: "Identity & Discrimination", value: "identity & discrimination" },
    { label: "Career Preparation", value: "career preparation" },
    { label: "Language Barriers", value: "language barriers" },
    { label: "Support Networks", value: "support networks" },
    { label: "Personal Growth", value: "personal growth" },
  ],
})

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

export const FILTER_KEYS = ["themes", "year", "sentiment", "category"]

const ACCORDION_VALUES = { themes: "a", year: "b", sentiment: "c", category: "d" }

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
}) {
  const [categoryItems, setCategoryItems] = useState(() =>
    DEFAULT_CATEGORIES.map((label) => ({ label, value: label.toLowerCase().replace(/\s+/g, "-") }))
  )

  // Load categories from categories.txt
  useEffect(() => {
    fetch("/categories.txt")
      .then((res) => res.text())
      .then((text) => {
        const lines = text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
        if (lines.length > 0) {
          setCategoryItems(
            lines.map((label) => ({
              label,
              value: label.toLowerCase().replace(/\s+/g, "-"),
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
                collection={themes}
                selectionMode="multiple"
                value={selectedThemes}
                onValueChange={(e) => setSelectedThemes(e.value)}
              >
                <Listbox.Content>
                  {themes.items.map((option) => (
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
                collection={years}
                selectionMode="multiple"
                value={selectedYears}
                onValueChange={(e) => setSelectedYears(e.value)}
              >
                <Listbox.Content>
                  {years.items.map((option) => (
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
                collection={sentiments}
                selectionMode="multiple"
                value={selectedSentiments}
                onValueChange={(e) => setSelectedSentiments(e.value)}
              >
                <Listbox.Content>
                  {sentiments.items.map((option) => (
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

        {/* Categories (from categories.txt) */}
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

      </Accordion.Root>
    </Container>
  )
}
