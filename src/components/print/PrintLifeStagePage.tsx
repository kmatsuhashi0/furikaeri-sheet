import { PrintField, PrintTextarea } from './PrintField'
import { StageBadge } from '../StageBadge'
import type { LifeStageDef } from '../../data/lifeStages'
import type { LifeStageAnswers } from '../../types'

interface PrintLifeStagePageProps {
  stage: LifeStageDef
  answers: LifeStageAnswers
}

export function PrintLifeStagePage({ stage, answers }: PrintLifeStagePageProps) {
  return (
    <div className="page">
      <section className="sheet-section">
        <div className="stage-header">
          <StageBadge top={stage.badgeTop} bottom={stage.badgeBottom} equalWeight={stage.id === 'future'} />
          <div className="stage-header__text">
            <p className="stage-intro">{stage.intro}</p>
          </div>
        </div>

        <div className="info-card">
          {stage.schoolNameLabel && <PrintField label={stage.schoolNameLabel} value={answers.schoolName} />}

          {stage.fields?.map((field) => (
            <PrintTextarea key={field.id} label={field.label} value={answers.values[field.id] ?? ''} />
          ))}

          {stage.questions?.map((question) => (
            <PrintTextarea key={question.id} label={question.label} value={answers.values[question.id] ?? ''} />
          ))}
        </div>
      </section>
    </div>
  )
}
