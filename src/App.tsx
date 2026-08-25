import { useEffect, useState } from 'react'
import { BasicInfoPage } from './components/BasicInfoPage'
import { LifeStagePage } from './components/LifeStagePage'
import { OutlineNav } from './components/OutlineNav'
import { ConfirmationPage } from './components/ConfirmationPage'
import { useDraftStorage } from './hooks/useDraftStorage'
import { LIFE_STAGES, type LifeStageDef, type LifeStageId } from './data/lifeStages'
import { calculateAge } from './utils/age'
import './styles/app.css'

type PageDescriptor = { kind: 'basicInfo' } | { kind: 'lifeStage'; stage: LifeStageDef }

const ALL_PAGES: PageDescriptor[] = [
  { kind: 'basicInfo' },
  ...LIFE_STAGES.map((stage): PageDescriptor => ({ kind: 'lifeStage', stage })),
]

function App() {
  const { formData, setFormData, loadError, saveError } = useDraftStorage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [outlineOpen, setOutlineOpen] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [sent, setSent] = useState(false)

  const { age } = calculateAge(formData.profile.birthDate)

  const visiblePages = ALL_PAGES.filter((page) => {
    if (page.kind === 'basicInfo') return true
    if (page.stage.minAge === null) return true
    if (age === null) return true
    return age >= page.stage.minAge
  })

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, visiblePages.length - 1))
  }, [visiblePages.length])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentIndex, showConfirmation, sent])

  const currentPage = visiblePages[currentIndex]

  const outlineItems = visiblePages.map((page, index) => ({
    index,
    label: page.kind === 'basicInfo' ? '基本情報' : page.stage.heading,
  }))

  const updateSchoolName = (stageId: LifeStageId, value: string) => {
    setFormData((prev) => ({
      ...prev,
      lifeStages: {
        ...prev.lifeStages,
        [stageId]: { ...prev.lifeStages[stageId], schoolName: value },
      },
    }))
  }

  const updateStageValue = (stageId: LifeStageId, fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      lifeStages: {
        ...prev.lifeStages,
        [stageId]: {
          ...prev.lifeStages[stageId],
          values: { ...prev.lifeStages[stageId].values, [fieldId]: value },
        },
      },
    }))
  }

  const isLastPage = currentIndex === visiblePages.length - 1
  const isFuturePage = currentPage.kind === 'lifeStage' && currentPage.stage.id === 'future'

  if (sent) {
    return (
      <div className="sent-page">
        <p className="sent-page__message">
          送信しました。
          <br />
          ご協力ありがとうございます。
          <br />
          担当者からのご連絡をお待ちくださいませ。
        </p>
      </div>
    )
  }

  if (showConfirmation) {
    return (
      <div className="layout">
        <div className="app">
          <ConfirmationPage
            formData={formData}
            visibleStages={visiblePages.flatMap((page) => (page.kind === 'lifeStage' ? [page.stage] : []))}
            onBack={() => setShowConfirmation(false)}
            onSent={() => setSent(true)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="layout">
      <div className="app">
        {currentPage.kind === 'basicInfo' && (
          <header className="app-header">
            <h1 className="app-header__title">振り返りシート</h1>
            <p className="app-header__lede">
              振り返りシートは人生を振り返ることで様々なことを思い返していただき、インタビューに向けてご自身の中で整理をしていただくためのものです。
              <br />
              全てを記入する必要はございませんので、メモのような感覚でご自由にお使いください。
            </p>
          </header>
        )}

        {loadError && <div className="notice notice--warn">{loadError}</div>}
        {saveError && <div className="notice notice--warn">{saveError}</div>}

        <main>
          {currentPage.kind === 'basicInfo' ? (
            <BasicInfoPage formData={formData} setFormData={setFormData} />
          ) : (
            <LifeStagePage
              stage={currentPage.stage}
              answers={formData.lifeStages[currentPage.stage.id]}
              onSchoolNameChange={(value) => updateSchoolName(currentPage.stage.id, value)}
              onValueChange={(fieldId, value) => updateStageValue(currentPage.stage.id, fieldId, value)}
            />
          )}

          {isFuturePage && isLastPage && (
            <button type="button" className="confirm-cta" onClick={() => setShowConfirmation(true)}>
              入力内容を確認する
            </button>
          )}
        </main>

        <footer className="page-nav">
          <div className="page-nav__inner">
            <div className="page-nav__row">
              <button
                type="button"
                className="page-nav__button"
                onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                disabled={currentIndex === 0}
              >
                ← 戻る
              </button>
              <div className="page-nav__status">
                <span>
                  {currentIndex + 1} / {visiblePages.length}
                </span>
                <button type="button" className="page-nav__outline-toggle" onClick={() => setOutlineOpen(true)}>
                  ☰ 目次
                </button>
              </div>
              <button
                type="button"
                className="page-nav__button"
                onClick={() => setCurrentIndex((index) => Math.min(visiblePages.length - 1, index + 1))}
                disabled={isLastPage}
              >
                次へ →
              </button>
            </div>
          </div>
        </footer>

        <p className="storage-note">入力内容はこの端末に自動的に保存されます。</p>
      </div>

      <OutlineNav
        items={outlineItems}
        currentIndex={currentIndex}
        onSelect={(index) => {
          setCurrentIndex(index)
          setOutlineOpen(false)
        }}
        isOpen={outlineOpen}
        onClose={() => setOutlineOpen(false)}
        onConfirm={() => {
          setShowConfirmation(true)
          setOutlineOpen(false)
        }}
      />
    </div>
  )
}

export default App
