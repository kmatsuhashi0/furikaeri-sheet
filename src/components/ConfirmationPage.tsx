import { useState } from 'react'
import { calculateAge } from '../utils/age'
import { buildSummaryText } from '../utils/summary'
import type { LifeStageDef } from '../data/lifeStages'
import type { FormData } from '../types'

type SendStatus = 'idle' | 'sending' | 'error'

interface ConfirmationPageProps {
  formData: FormData
  visibleStages: LifeStageDef[]
  onBack: () => void
  onSent: () => void
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="review-item">
      <dt>{label}</dt>
      <dd>{value.trim() ? value : '（未記入）'}</dd>
    </div>
  )
}

export function ConfirmationPage({ formData, visibleStages, onBack, onSent }: ConfirmationPageProps) {
  const { profile, family, lifeStages } = formData
  const { age } = calculateAge(profile.birthDate)
  const filledFamily = family.filter(
    (member) => member.relationship.trim() || member.nameFurigana.trim() || member.birthYear.trim() || member.note.trim(),
  )

  const [status, setStatus] = useState<SendStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const handleSubmit = async () => {
    setStatus('sending')
    setErrorMessage(null)
    try {
      const response = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `振り返りシートの回答（${profile.name.trim() || '氏名未記入'}）`,
          body: buildSummaryText(formData, visibleStages),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error ?? '送信に失敗しました。')
      }

      onSent()
    } catch {
      setStatus('error')
      setErrorMessage('送信に失敗しました。しばらくしてから、もう一度お試しください。')
    }
  }

  return (
    <div className="page">
      <header className="app-header">
        <p className="app-header__eyebrow">入力内容の確認</p>
        <h1 className="app-header__title">これまでの入力内容</h1>
        <p className="app-header__lede">送信する前に、入力していただいた内容をご確認ください。</p>
      </header>

      <section className="sheet-section">
        <h2 className="sheet-section__title">基本情報</h2>
        <dl className="review-list">
          <ReviewItem label="お名前" value={profile.name} />
          <ReviewItem label="ふりがな" value={profile.furigana} />
          <ReviewItem label="あだ名（小さな頃に呼ばれていた名前）" value={profile.nickname} />
          <ReviewItem label="生年月日" value={profile.birthDate ? `${profile.birthDate}（現在 ${age} 歳）` : ''} />
          <ReviewItem label="ライフストーリームービーを制作したいと思ったきっかけ" value={profile.movieReason} />
          <ReviewItem label="趣味や生きがいなど、日々の生活について" value={profile.dailyLife} />
        </dl>
      </section>

      <section className="sheet-section">
        <h2 className="sheet-section__title">家族について</h2>
        {filledFamily.length === 0 ? (
          <p className="review-empty">入力はありません。</p>
        ) : (
          <ul className="review-family-list">
            {filledFamily.map((member) => (
              <li key={member.id} className="review-family-item">
                <span className="review-family-item__relationship">{member.relationship || '（続柄未記入）'}</span>
                <span>{member.nameFurigana}</span>
                <span>{member.birthYear && `${member.birthYear}生まれ`}</span>
                <span>{member.note}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {visibleStages.map((stage) => {
        const answers = lifeStages[stage.id]
        return (
          <section className="sheet-section" key={stage.id}>
            <h2 className="sheet-section__title">{stage.heading}</h2>
            <dl className="review-list">
              {stage.schoolNameLabel && <ReviewItem label={stage.schoolNameLabel} value={answers.schoolName} />}
              {stage.fields?.map((field) => (
                <ReviewItem key={field.id} label={field.label} value={answers.values[field.id] ?? ''} />
              ))}
              {stage.questions?.map((question) => (
                <ReviewItem key={question.id} label={question.label} value={answers.values[question.id] ?? ''} />
              ))}
            </dl>
          </section>
        )
      })}

      <div className="confirmation-actions">
        <button type="button" className="page-nav__button" onClick={onBack}>
          ← 編集に戻る
        </button>
      </div>

      <button type="button" className="confirm-cta" onClick={handleSubmit} disabled={status === 'sending'}>
        {status === 'sending' ? '送信しています…' : '送信する'}
      </button>
      {status === 'error' && errorMessage && <div className="notice notice--warn">{errorMessage}</div>}
      <p className="review-note">「送信する」を押すと、入力していただいた内容がまとめて送信されます。</p>

      <div className="scroll-top-row">
        <button type="button" className="scroll-top-button" onClick={scrollToTop}>
          ↑ ページの一番上に戻る
        </button>
      </div>
    </div>
  )
}
