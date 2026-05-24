import { describe, expect, test } from 'vitest'
import {
  generateDraftBundle,
  type DraftInput,
} from './draftGenerator'

const baseInput: DraftInput = {
  bullets: [
    'launched client invoice portal for faster approvals',
    'cut reimbursement review time from days to minutes',
    'gave finance leaders clearer exception tracking',
  ],
  audience: 'finance operations leaders',
  goal: 'invite people to rethink manual approval work',
  tone: 'confident',
  hookStyle: 'insight',
}

describe('generateDraftBundle', () => {
  test('builds hook body CTA drafts for all length variants from bullets', () => {
    const bundle = generateDraftBundle(baseInput)

    expect(bundle.drafts).toHaveLength(3)
    expect(bundle.drafts.map((draft) => draft.length)).toEqual([
      'short',
      'standard',
      'expanded',
    ])

    const standard = bundle.drafts.find((draft) => draft.length === 'standard')
    expect(standard?.hook).toContain('finance operations leaders')
    expect(standard?.body).toContain('client invoice portal')
    expect(standard?.body).toContain('reimbursement review time')
    expect(standard?.cta).toContain('rethink manual approval work')
    expect(standard?.post).toContain(standard?.hook)
    expect(standard?.post).toContain(standard?.cta)
  })

  test('changes hook and closing language for tone and hook controls', () => {
    const warmStory = generateDraftBundle({
      ...baseInput,
      tone: 'warm',
      hookStyle: 'story',
    })

    const boldQuestion = generateDraftBundle({
      ...baseInput,
      tone: 'bold',
      hookStyle: 'question',
    })

    expect(warmStory.drafts[0].hook).toContain('Behind every')
    expect(warmStory.drafts[0].cta).toContain('What would you simplify next')
    expect(boldQuestion.drafts[0].hook).toMatch(/\?$/)
    expect(boldQuestion.drafts[0].cta).toContain('Stop letting')
  })

  test('suggests clean LinkedIn hashtags from the strongest bullet terms', () => {
    const bundle = generateDraftBundle(baseInput)

    expect(bundle.hashtags).toEqual([
      '#FinanceOperations',
      '#InvoicePortal',
      '#Approvals',
      '#ReimbursementReview',
      '#ExceptionTracking',
    ])
  })

  test('filters empty bullets and still produces a useful starter draft', () => {
    const bundle = generateDraftBundle({
      ...baseInput,
      bullets: ['  ', '- improved month-end confidence', '', '• reduced approval stalls'],
      audience: 'small business owners',
      goal: 'ask how they handle approval bottlenecks',
    })

    expect(bundle.drafts[0].body.toLowerCase()).toContain(
      'improved month-end confidence',
    )
    expect(bundle.drafts[0].body.toLowerCase()).toContain(
      'reduced approval stalls',
    )
    expect(bundle.drafts[0].body).not.toContain('•')
    expect(bundle.drafts[0].cta).toContain('approval bottlenecks')
    expect(bundle.hashtags).not.toContain('#')
  })

  test('splits pasted bullet blocks before composing posts and hashtags', () => {
    const bundle = generateDraftBundle({
      ...baseInput,
      bullets: ['reduced approval stalls\nimproved month-end confidence'],
      audience: 'small business owners',
    })

    expect(bundle.drafts[0].body).toContain('Reduced approval stalls')
    expect(bundle.drafts[0].body).toContain('Improved month-end confidence')
    expect(bundle.hashtags).not.toContain('#Stallsnimproved')
    expect(bundle.hashtags).toContain('#ApprovalStalls')
    expect(bundle.hashtags).toContain('#MonthEndConfidence')
    expect(bundle.hashtags).not.toContain('#Approval')
    expect(bundle.hashtags).not.toContain('#Stalls')
  })
})
