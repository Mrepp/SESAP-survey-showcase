// Functions used for building data/lists from across all interviews
// Used for building filter options and data for visualizations


// Normalize to a comparable hyphenated key: lowercase, trim, collapse whitespace
// and underscores to single hyphens (e.g. 'Campus Life', 'campus_life' → 'campus-life')
export function standardize(value) {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[_\s]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

export function formatDate(value, options) {
    if (!value) return ''
    const d = typeof value === 'string' ? new Date(value) : value
    return d.toLocaleDateString(undefined, options)
}


//-------------------Build functions for filter options-------------------
export function buildMajorOptions(interviews) {
    if (!Array.isArray(interviews)) return null
    const majors = new Set()
    for (const iv of interviews) {
        const major = iv.demographics?.major
        if (major != null && String(major).trim()) {
            majors.add(String(major).trim())
        }
    }
    if (majors.size === 0) return null
    return Array.from(majors).sort().map((label) => ({
        label,
        value: standardize(label),
    }))
}

export function buildThemeOptions(interviews) {
    if (!Array.isArray(interviews)) return null
    const titles = new Set()
    for (const iv of interviews) {
        const themes = iv.analysis?.themes
        if (!Array.isArray(themes)) continue
        for (const t of themes) {
            if (t.title) titles.add(t.title)
        }
    }
    if (titles.size === 0) return null
    return Array.from(titles).sort().map((t) => ({ label: t, value: t.toLowerCase() }))
}

export function interviewDateYearString(iv) {
    const raw = iv.metadata?.interviewDate
    if (raw == null || raw === '') return ''
    const date = typeof raw === 'string' ? new Date(raw) : raw
    const year = date.getFullYear()
    if (Number.isFinite(year)) return String(year)
    else return ''
}

export function buildYearOptions(interviews) {
    if (!Array.isArray(interviews)) return null
    const years = new Set()
    for (const iv of interviews) {
        const y = interviewDateYearString(iv)
        if (y) years.add(y)
    }
    if (years.size === 0) return null
    return Array.from(years)
        .sort((a, b) => Number(a) - Number(b))
        .map((label) => ({ label, value: label }))
}

// builds a year range options from 1900 to 2100 in 5 year increments (e.g. 2000-2004, 2005-2009, etc.)
export function buildYearRangeOptions(interviews) {
    if (!Array.isArray(interviews)) return null
    const years = new Set()
    for (const iv of interviews) {
        const gy = iv.demographics?.graduationYear ?? iv.demographics?.year
        const num = Number(gy)
        if (num && num >= 1900 && num <= 2100) years.add(num)
    }
    if (years.size === 0) return null
    const sorted = Array.from(years).sort((a, b) => a - b)
    const minYear = Math.floor(sorted[0] / 5) * 5
    const maxYear = Math.ceil((sorted[sorted.length - 1] + 1) / 5) * 5
    const ranges = []
    for (let start = minYear; start < maxYear; start += 5) {
        const end = start + 4
        const label = `${start}-${end}`
        ranges.push({ label, value: label })
    }
    return ranges.length > 0 ? ranges : null
}


//-------------------Build function for improvements page-------------------
export function buildImprovementsFromInterviews(interviews) {
    if (!Array.isArray(interviews)) return []
    const list = []
    for (const iv of interviews) {
        const interviewId = iv.id
        const areas = iv.analysis.areasForImprovement
        if (!Array.isArray(areas)) continue
        for (const a of areas) {
            list.push({
                interviewId,
                major: standardize(iv.demographics?.major),
                area: String(a.area ?? ''),
                description: String(a.description ?? ''),
                categories: standardize(a.category ?? 'other'),
                priority: String(a.priority ?? 'medium').toLowerCase(),
            })
        }
    }
    return list
}


//-------------------Build function for themes page-------------------
export function buildThemesFromInterviews(interviews) {
    if (!Array.isArray(interviews)) return []
    const themeMap = new Map()

    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }

    for (const iv of interviews) {
        const themes = iv.analysis?.themes
        if (!Array.isArray(themes)) continue

        for (const t of themes) {
            const title = String(t.title ?? '').trim()
            if (!title) continue

            if (!themeMap.has(title)) {
                themeMap.set(title, { frequencies: [], category: t.category, interviews: [] })
            }
            const entry = themeMap.get(title)
            entry.frequencies.push(Number(t.frequency ?? 0) || 0)
            if (t.category) entry.category = t.category
            entry.interviews.push({
                interviewId: iv.id,
                videoUrl: iv.videoUrl ?? '/placeholder16x9.jpg',
                videoAlt: `${iv.title ?? iv.id} interview`,
                name: iv.title ?? 'Interviewee Name',
                date: formatDate(iv.metadata?.interviewDate, dateOptions),
                description: '',
            })
        }
    }

    return Array.from(themeMap.entries()).map(([title, entry]) => ({
        theme: title,
        impactScore: entry.frequencies.length > 0
            ? String(Math.round(entry.frequencies.reduce((a, b) => a + b, 0) / entry.frequencies.length))
            : '0',
        frequency: String(entry.interviews.length),
        category: entry.category ?? 'other',
        interviews: entry.interviews,
    }))
}


//-------------------Build functions for visualizations on insights page-------------------
// Aggregate themes across all interviews for BubbleChart
export function buildBubbleData(interviews) {
    if (!Array.isArray(interviews)) return []
    const themeMap = new Map()
    for (const iv of interviews) {
        for (const t of (iv.analysis?.themes ?? [])) {
            const title = String(t.title ?? '').trim()
            if (title) {
                if (!themeMap.has(title)) {
                    themeMap.set(title, { title, totalFreq: 0, count: 0, category: t.category ?? 'other' })
                }
                const entry = themeMap.get(title)
                entry.totalFreq += (Number(t.frequency) || 1)
                entry.count += 1
            }
        }
    }
    return Array.from(themeMap.values()).map(e => ({
        title: e.title,
        impactScore: Math.round(e.totalFreq / e.count),
        category: e.category,
    }))
}

// Build word cloud text from all quotes and summaries
export function buildWordCloudText(interviews) {
    if (!Array.isArray(interviews)) return ''
    const parts = []
    for (const iv of interviews) {
        for (const q of (iv.analysis?.quotes ?? [])) {
            if (q.quoteText) parts.push(q.quoteText)
        }
        for (const s of (iv.analysis?.summaries ?? [])) {
            if (s.summaryText) parts.push(s.summaryText)
        }
    }
    return parts.join(' ')
}

// Compute Pearson correlation between two arrays
function pearsonCorrelation(x, y) {
    const n = x.length
    if (n === 0) return 0
    const mx = x.reduce((s, v) => s + v, 0) / n
    const my = y.reduce((s, v) => s + v, 0) / n
    let xy = 0, xx = 0, yy = 0
    for (let i = 0; i < n; i++) {
        xy += (x[i] - mx) * (y[i] - my)
        xx += (x[i] - mx) ** 2
        yy += (y[i] - my) ** 2
    }
    const denom = Math.sqrt(xx * yy)
    return denom === 0 ? 0 : xy / denom
}

// Measures how often two themes appear together vs. separately.
export function buildThemeCorrelations(interviews) {
    if (!Array.isArray(interviews) || interviews.length < 2) return []

    const themeCounts = new Map()
    const interviewThemeSets = []

    for (const iv of interviews) {
        const set = new Set()
        for (const t of (iv.analysis?.themes ?? [])) {
            const title = String(t.title ?? '').trim()
            if (title){
                set.add(title)
                themeCounts.set(title, (themeCounts.get(title) || 0) + 1)
            }
        }
        interviewThemeSets.push(set)
    }

    const themesSorted = Array.from(themeCounts.entries())
        .filter(([, count]) => count >= 1)
        .sort((a, b) => b[1] - a[1])
        .map(([title]) => title)
        .sort((a, b) => a.localeCompare(b))

    if (themesSorted.length < 2) return []

    const correlations = []
    for (const themeA of themesSorted) {
        for (const themeB of themesSorted) {
            let r
            if (themeA === themeB) {
                r = 1
            } else {
                const x = interviewThemeSets.map((s) => (s.has(themeA) ? 1 : 0))
                const y = interviewThemeSets.map((s) => (s.has(themeB) ? 1 : 0))
                r = pearsonCorrelation(x, y)
                if (Number.isNaN(r)) r = 0
            }
            correlations.push({ a: themeA, b: themeB, correlation: r })
        }
    }
    return correlations
}

// Build theme × identity counts for stacked bar chart.
export function buildBarChartData(interviews) {
    if (!Array.isArray(interviews)) return []
    const themeIdentities = new Map()

    for (const iv of interviews) {
        const themes = iv.analysis?.themes ?? []
        const identityLabels = (iv.analysis?.identities ?? [])
            .map(i => i?.label)
            .filter(Boolean)

        if (identityLabels.length === 0) continue

        for (const t of themes) {
            if (!t.title) continue
            if (!themeIdentities.has(t.title)) {
                themeIdentities.set(t.title, {})
            }
            const identities = themeIdentities.get(t.title)
            for (const label of identityLabels) {
                identities[label] = (identities[label] || 0) + 1
            }
        }
    }

    return Array.from(themeIdentities.entries()).map(([theme, identities]) => ({
        theme,
        identities,
    }))
}

export function buildMajorDoughnutChartData(interviews) {
    if (!Array.isArray(interviews)) return []
    const majors = new Map()
    for (const iv of interviews) {
        const major = iv.demographics?.major
        if (major != null && String(major).trim()) {
            majors.set(major, (majors.get(major) || 0) + 1)
        }
    } return Array.from(majors.entries()).map(([major, count]) => ({
        major,
        count,
    }))
}
