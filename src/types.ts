import type { LifeStageId } from './data/lifeStages'

export interface ProfileData {
  furigana: string
  name: string
  nickname: string
  birthDate: string
  movieReason: string
  dailyLife: string
}

export interface FamilyMember {
  id: string
  relationship: string
  nameFurigana: string
  birthYear: string
  note: string
}

export interface LifeStageAnswers {
  schoolName: string
  values: Record<string, string>
}

export type LifeStageAnswersMap = Record<LifeStageId, LifeStageAnswers>

export interface FormData {
  profile: ProfileData
  family: FamilyMember[]
  lifeStages: LifeStageAnswersMap
}
