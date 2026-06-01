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

// Display label: hyphens, underscores, or spaces as word separators → title case (e.g. mental-health → Mental Health).
export function capitalize(raw) {
    const s = String(raw ?? "")
        .trim()
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
    if (!s) return ""
    return s
        .split(" ")
        .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
        .filter(Boolean)
        .join(" ")
}

export function formatDate(value, options) {
    if (!value) return ''
    const d = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value
    return d.toLocaleDateString(undefined, options)
}