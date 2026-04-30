// Visual tokens for the interview timeline. Mirrors the term-midpoint anchors
// used by the LLM prompt and the admin TimelineEditor.

export const TERM_MIDPOINTS = {
    pre_college: -0.125,
    freshman_fall: 0.03125,
    freshman_winter: 0.09375,
    freshman_spring: 0.15625,
    freshman_summer: 0.21875,
    sophomore_fall: 0.28125,
    sophomore_winter: 0.34375,
    sophomore_spring: 0.40625,
    sophomore_summer: 0.46875,
    junior_fall: 0.53125,
    junior_winter: 0.59375,
    junior_spring: 0.65625,
    junior_summer: 0.71875,
    senior_fall: 0.78125,
    senior_winter: 0.84375,
    senior_spring: 0.90625,
    senior_summer: 0.96875,
    post_college: 1.125,
    unknown: 0.5,
}

export const SENTIMENT_RING = {
    positive: '#C68B3F', // warm gold
    negative: '#5B6770', // muted slate
    mixed: '#A05C2C',    // burnt — split-stop in render
    neutral: '#A8A29A',  // sand
}

export const SIGNIFICANCE_RADIUS = {
    high: 8,
    medium: 6,
    low: 4,
    default: 5,
}

export const CHEVRON_PALETTE = [
    { key: 'pre_college',  label: 'Pre-College',  start: -0.25, end: 0.0, color: '#C7C7C7' },
    { key: 'freshman',     label: 'Freshman',     start: 0.0,   end: 0.25, color: '#FAAB8E' },
    { key: 'sophomore',    label: 'Sophomore',    start: 0.25,  end: 0.5,  color: '#F88A62' },
    { key: 'junior',       label: 'Junior',       start: 0.5,   end: 0.75, color: '#F76A36' },
    { key: 'senior',       label: 'Senior',       start: 0.75,  end: 1.0,  color: '#D73F09' },
    { key: 'post_college', label: 'Post-College', start: 1.0,   end: 1.25, color: '#A12E08' },
]

export const QUARTER_TICKS = [
    { pos: 0.0625,  label: 'Fall'   },
    { pos: 0.125,   label: 'Winter' },
    { pos: 0.1875,  label: 'Spring' },
    { pos: 0.25,    label: 'Summer' },
]
