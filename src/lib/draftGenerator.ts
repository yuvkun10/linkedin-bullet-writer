export type DraftTone = 'confident' | 'warm' | 'bold' | 'practical'

export type HookStyle = 'insight' | 'story' | 'question' | 'contrarian'

export type DraftLength = 'short' | 'standard' | 'expanded'

export interface DraftInput {
  bullets: string[]
  audience: string
  goal: string
  tone: DraftTone
  hookStyle: HookStyle
}

export interface LinkedInDraft {
  length: DraftLength
  label: string
  hook: string
  body: string
  cta: string
  post: string
}

export interface DraftBundle {
  drafts: LinkedInDraft[]
  hashtags: string[]
}

const lengthLabels: Record<DraftLength, string> = {
  short: 'Short punchy post',
  standard: 'Standard LinkedIn post',
  expanded: 'Expanded thought-leader post',
}

const fillerWords = new Set([
  'and',
  'for',
  'from',
  'gave',
  'with',
  'the',
  'time',
  'into',
  'days',
  'clearer',
  'faster',
  'leaders',
  'manual',
  'client',
  'small',
  'people',
  'their',
  'work',
  'worked',
  'reduced',
  'improved',
])

export function generateDraftBundle(input: DraftInput): DraftBundle {
  const bullets = normalizeBullets(input.bullets)
  const safeBullets =
    bullets.length > 0
      ? bullets
      : ['clarified the problem', 'shared the lesson', 'invited discussion']

  const drafts = (['short', 'standard', 'expanded'] as const).map((length) => {
    const hook = buildHook(input, safeBullets)
    const body = buildBody(length, safeBullets, input)
    const cta = buildCta(input)

    return {
      length,
      label: lengthLabels[length],
      hook,
      body,
      cta,
      post: [hook, body, cta, buildHashtagLine(input, safeBullets)]
        .filter(Boolean)
        .join('\n\n'),
    }
  })

  return {
    drafts,
    hashtags: suggestHashtags(input, safeBullets),
  }
}

function normalizeBullets(bullets: string[]): string[] {
  return bullets
    .flatMap((bullet) => bullet.split(/\r?\n|\\n/))
    .map((bullet) =>
      bullet
        .trim()
        .replace(/^[-*•\d.)\s]+/, '')
        .replace(/[.!?]+$/, '')
        .trim(),
    )
    .filter(Boolean)
}

function buildHook(input: DraftInput, bullets: string[]): string {
  const lead = sentenceCase(bullets[0])

  if (input.hookStyle === 'story') {
    return `Behind every better result is a practical shift: ${lead}.`
  }

  if (input.hookStyle === 'question') {
    return `What if ${input.audience} stopped accepting ${bullets[0]} as the hard part?`
  }

  if (input.hookStyle === 'contrarian') {
    return `${sentenceCase(input.audience)} do not need more status meetings. They need clearer operating moves.`
  }

  return `For ${input.audience}, the fastest wins often start with one operational insight: ${lead}.`
}

function buildBody(
  length: DraftLength,
  bullets: string[],
  input: DraftInput,
): string {
  const points = bullets.map(sentenceCase)

  if (length === 'short') {
    return `${joinWithCommas(points)}. That is the kind of focused progress that turns a rough process into a repeatable advantage.`
  }

  if (length === 'expanded') {
    return [
      `The work was not about adding more process for ${input.audience}. It was about making the right work visible at the right moment.`,
      `The strongest moves were:\n${points.map((point) => `- ${point}`).join('\n')}.`,
      `When those pieces line up, teams spend less energy chasing updates and more energy making decisions with confidence.`,
    ].join('\n\n')
  }

  return [
    `The work centered on three practical moves:\n${points.map((point) => `- ${point}`).join('\n')}.`,
    `Each one made the workflow easier to trust, easier to explain, and easier to improve.`,
  ].join('\n\n')
}

function buildCta(input: DraftInput): string {
  if (input.tone === 'warm') {
    return `What would you simplify next to ${input.goal}?`
  }

  if (input.tone === 'bold') {
    return `Stop letting slow workflows decide the pace. Use this as the prompt to ${input.goal}.`
  }

  if (input.tone === 'practical') {
    return `If you want to ${input.goal}, start by naming the step everyone already works around.`
  }

  return `If your team is ready to ${input.goal}, start with the one approval step everyone works around.`
}

function suggestHashtags(input: DraftInput, bullets: string[]): string[] {
  const candidates = [
    input.audience,
    ...extractPhrases(bullets),
    input.goal,
  ]

  const hashtags = candidates
    .map(toHashtag)
    .filter((tag): tag is string => Boolean(tag))

  return [...new Set(hashtags)].slice(0, 5)
}

function extractPhrases(bullets: string[]): string[] {
  const joined = bullets.join(' ').toLowerCase()
  const mappedPhrases: string[] = []

  if (joined.includes('invoice portal')) mappedPhrases.push('invoice portal')
  if (joined.includes('approval stalls')) mappedPhrases.push('approval stalls')
  if (joined.includes('approval')) mappedPhrases.push('approvals')
  if (joined.includes('month-end confidence')) {
    mappedPhrases.push('month-end confidence')
  }
  if (joined.includes('reimbursement review')) {
    mappedPhrases.push('reimbursement review')
  }
  if (joined.includes('exception tracking')) mappedPhrases.push('exception tracking')

  const discovered = bullets
    .flatMap((bullet) => bullet.toLowerCase().split(/\s+/))
    .map((word) => word.replace(/[^a-z0-9]/g, ''))
    .filter(
      (word) =>
        word.length > 4 &&
        !fillerWords.has(word) &&
        !['approval', 'stalls'].includes(word),
    )

  return [...mappedPhrases, ...discovered]
}

function buildHashtagLine(input: DraftInput, bullets: string[]): string {
  return suggestHashtags(input, bullets).join(' ')
}

function toHashtag(value: string): string | null {
  const words = value
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !fillerWords.has(word.toLowerCase()))

  if (words.length === 0) return null

  const tag = words.map((word) => capitalize(word)).join('')
  return tag.length > 2 ? `#${tag}` : null
}

function sentenceCase(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`
}

function joinWithCommas(values: string[]): string {
  if (values.length <= 1) return values[0] ?? ''
  if (values.length === 2) return `${values[0]} and ${values[1]}`
  return `${values.slice(0, -1).join(', ')}, and ${values.at(-1)}`
}
