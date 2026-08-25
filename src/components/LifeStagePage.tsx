import { AutoTextarea } from './AutoTextarea'
import { FormField } from './FormField'
import { StageBadge } from './StageBadge'
import type { LifeStageDef } from '../data/lifeStages'
import type { LifeStageAnswers } from '../types'

interface LifeStagePageProps {
  stage: LifeStageDef
  answers: LifeStageAnswers
  onSchoolNameChange: (value: string) => void
  onValueChange: (fieldId: string, value: string) => void
}

export function LifeStagePage({ stage, answers, onSchoolNameChange, onValueChange }: LifeStagePageProps) {
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
          {stage.schoolNameLabel && (
            <FormField label={stage.schoolNameLabel} htmlFor={`${stage.id}-schoolName`}>
              <input
                id={`${stage.id}-schoolName`}
                type="text"
                value={answers.schoolName}
                onChange={(event) => onSchoolNameChange(event.target.value)}
              />
            </FormField>
          )}

          {stage.fields?.map((field) => (
            <FormField key={field.id} label={field.label} htmlFor={`${stage.id}-${field.id}`}>
              <AutoTextarea
                id={`${stage.id}-${field.id}`}
                value={answers.values[field.id] ?? ''}
                onChange={(event) => onValueChange(field.id, event.target.value)}
              />
            </FormField>
          ))}

          {stage.questions?.map((question) => (
            <FormField key={question.id} label={question.label} htmlFor={`${stage.id}-${question.id}`}>
              <AutoTextarea
                id={`${stage.id}-${question.id}`}
                value={answers.values[question.id] ?? ''}
                onChange={(event) => onValueChange(question.id, event.target.value)}
              />
            </FormField>
          ))}
        </div>

        {stage.hints && (
          <div className="hint-panel">
            <h3 className="hint-panel__title">書くことに困ったら</h3>
            <ul className="hint-panel__list">
              {stage.hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}
