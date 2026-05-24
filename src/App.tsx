import { useMemo, useState, type ReactNode } from 'react'
import {
  Check,
  Clipboard,
  Download,
  FileText,
  PenLine,
  RefreshCcw,
  Sparkles,
} from 'lucide-react'
import './App.css'
import {
  generateDraftBundle,
  type DraftLength,
  type DraftTone,
  type HookStyle,
} from './lib/draftGenerator'

const starterBullets = [
  'launched client invoice portal for faster approvals',
  'cut reimbursement review time from days to minutes',
  'gave finance leaders clearer exception tracking',
]

const toneOptions: Array<{ value: DraftTone; label: string }> = [
  { value: 'confident', label: 'Confident' },
  { value: 'warm', label: 'Warm' },
  { value: 'bold', label: 'Bold' },
  { value: 'practical', label: 'Practical' },
]

const hookOptions: Array<{ value: HookStyle; label: string }> = [
  { value: 'insight', label: 'Insight' },
  { value: 'story', label: 'Story' },
  { value: 'question', label: 'Question' },
  { value: 'contrarian', label: 'Contrarian' },
]

const lengthOrder: DraftLength[] = ['short', 'standard', 'expanded']

function App() {
  const [bulletText, setBulletText] = useState(starterBullets.join('\n'))
  const [audience, setAudience] = useState('finance operations leaders')
  const [goal, setGoal] = useState('invite people to rethink manual approval work')
  const [tone, setTone] = useState<DraftTone>('confident')
  const [hookStyle, setHookStyle] = useState<HookStyle>('insight')
  const [selectedLength, setSelectedLength] = useState<DraftLength>('standard')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  const bullets = useMemo(
    () => bulletText.split('\n').map((line) => line.trim()),
    [bulletText],
  )

  const bundle = useMemo(
    () =>
      generateDraftBundle({
        bullets,
        audience,
        goal,
        tone,
        hookStyle,
      }),
    [audience, bullets, goal, hookStyle, tone],
  )

  const selectedDraft =
    bundle.drafts.find((draft) => draft.length === selectedLength) ??
    bundle.drafts[0]

  async function copyDraft() {
    await navigator.clipboard.writeText(selectedDraft.post)
    setCopyStatus('copied')
    window.setTimeout(() => setCopyStatus('idle'), 1800)
  }

  function exportDraft() {
    const blob = new Blob([selectedDraft.post], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `linkedin-${selectedDraft.length}-draft.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function resetExample() {
    setBulletText(starterBullets.join('\n'))
    setAudience('finance operations leaders')
    setGoal('invite people to rethink manual approval work')
    setTone('confident')
    setHookStyle('insight')
    setSelectedLength('standard')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <PenLine size={18} />
          </span>
          <div>
            <h1>LinkedIn Bullet Writer</h1>
            <p>Draft polished posts from rough notes.</p>
          </div>
        </div>
        <button className="ghost-button" type="button" onClick={resetExample}>
          <RefreshCcw size={16} aria-hidden="true" />
          Reset
        </button>
      </header>

      <section className="workspace" aria-label="LinkedIn post writer">
        <form className="editor-panel">
          <div className="panel-heading">
            <FileText size={18} aria-hidden="true" />
            <h2>Source</h2>
          </div>

          <label className="field">
            <span>Bullets</span>
            <textarea
              value={bulletText}
              onChange={(event) => setBulletText(event.target.value)}
              spellCheck="true"
              rows={8}
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Audience</span>
              <input
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                type="text"
              />
            </label>

            <label className="field">
              <span>CTA Goal</span>
              <input
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                type="text"
              />
            </label>
          </div>

          <ControlGroup label="Tone">
            {toneOptions.map((option) => (
              <button
                className={tone === option.value ? 'selected' : ''}
                key={option.value}
                type="button"
                onClick={() => setTone(option.value)}
              >
                {option.label}
              </button>
            ))}
          </ControlGroup>

          <ControlGroup label="Hook">
            {hookOptions.map((option) => (
              <button
                className={hookStyle === option.value ? 'selected' : ''}
                key={option.value}
                type="button"
                onClick={() => setHookStyle(option.value)}
              >
                {option.label}
              </button>
            ))}
          </ControlGroup>
        </form>

        <section className="preview-panel" aria-live="polite">
          <div className="panel-heading split">
            <div>
              <Sparkles size={18} aria-hidden="true" />
              <h2>Draft</h2>
            </div>
            <div className="action-row">
              <button className="icon-button" type="button" onClick={copyDraft}>
                {copyStatus === 'copied' ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <Clipboard size={16} aria-hidden="true" />
                )}
                {copyStatus === 'copied' ? 'Copied' : 'Copy'}
              </button>
              <button className="icon-button" type="button" onClick={exportDraft}>
                <Download size={16} aria-hidden="true" />
                Export
              </button>
            </div>
          </div>

          <div className="length-tabs" role="tablist" aria-label="Draft length">
            {lengthOrder.map((length) => {
              const draft = bundle.drafts.find((item) => item.length === length)
              return (
                <button
                  aria-selected={selectedLength === length}
                  className={selectedLength === length ? 'selected' : ''}
                  key={length}
                  role="tab"
                  type="button"
                  onClick={() => setSelectedLength(length)}
                >
                  {draft?.label ?? length}
                </button>
              )
            })}
          </div>

          <article className="draft-card">
            <DraftSection label="Hook" value={selectedDraft.hook} />
            <DraftSection label="Body" value={selectedDraft.body} multiline />
            <DraftSection label="CTA" value={selectedDraft.cta} />
          </article>

          <div className="hashtag-row" aria-label="Hashtag suggestions">
            {bundle.hashtags.map((hashtag) => (
              <button key={hashtag} type="button" onClick={() => copyHashtag(hashtag)}>
                {hashtag}
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

function ControlGroup({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <fieldset className="control-group">
      <legend>{label}</legend>
      <div>{children}</div>
    </fieldset>
  )
}

function DraftSection({
  label,
  multiline = false,
  value,
}: {
  label: string
  multiline?: boolean
  value: string
}) {
  return (
    <section className="draft-section">
      <span>{label}</span>
      {multiline ? (
        <div className="draft-body">
          {value.split('\n').map((line, index) =>
            line ? <p key={`${line}-${index}`}>{line}</p> : <br key={index} />,
          )}
        </div>
      ) : (
        <p>{value}</p>
      )}
    </section>
  )
}

function copyHashtag(hashtag: string) {
  void navigator.clipboard.writeText(hashtag)
}

export default App
