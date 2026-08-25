import type { LifeStageDef } from '../data/lifeStages'
import type { FormData } from '../types'
import { calculateAge } from './age'

function line(label: string, value: string): string {
  return `${label}：${value.trim() ? value.trim() : '（未記入）'}`
}

export function buildSummaryText(formData: FormData, visibleStages: LifeStageDef[]): string {
  const { profile, family, lifeStages } = formData
  const { age } = calculateAge(profile.birthDate)
  const blocks: string[] = []

  blocks.push(
    [
      '【基本情報】',
      line('お名前', profile.name),
      line('ふりがな', profile.furigana),
      line('あだ名（小さな頃に呼ばれていた名前）', profile.nickname),
      line('生年月日', profile.birthDate ? `${profile.birthDate}（現在 ${age} 歳）` : ''),
      line('ライフストーリームービーを制作したいと思ったきっかけ', profile.movieReason),
      line('趣味や生きがいなど、日々の生活について', profile.dailyLife),
    ].join('\n'),
  )

  const filledFamily = family.filter(
    (member) => member.relationship.trim() || member.nameFurigana.trim() || member.birthYear.trim() || member.note.trim(),
  )
  blocks.push(
    [
      '【家族について】',
      filledFamily.length === 0
        ? '（未記入）'
        : filledFamily
            .map((member) =>
              [member.relationship || '続柄未記入', member.nameFurigana, member.birthYear && `${member.birthYear}生まれ`, member.note]
                .filter(Boolean)
                .join('／'),
            )
            .join('\n'),
    ].join('\n'),
  )

  for (const stage of visibleStages) {
    const answers = lifeStages[stage.id]
    const lines = [`【${stage.heading}】`]
    if (stage.schoolNameLabel) {
      lines.push(line(stage.schoolNameLabel, answers.schoolName))
    }
    for (const field of stage.fields ?? []) {
      lines.push(line(field.label, answers.values[field.id] ?? ''))
    }
    for (const question of stage.questions ?? []) {
      lines.push(line(question.label, answers.values[question.id] ?? ''))
    }
    blocks.push(lines.join('\n'))
  }

  return blocks.join('\n\n')
}
