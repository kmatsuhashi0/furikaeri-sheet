import type { FamilyMember, FormData, LifeStageAnswersMap } from '../types'
import { LIFE_STAGES } from './lifeStages'

let idCounter = 0
export function createFamilyMemberId(): string {
  idCounter += 1
  return `family-${Date.now()}-${idCounter}`
}

export function createEmptyFamilyMember(): FamilyMember {
  return {
    id: createFamilyMemberId(),
    relationship: '',
    nameFurigana: '',
    birthYear: '',
    note: '',
  }
}

export function createInitialLifeStageAnswers(): LifeStageAnswersMap {
  const result = {} as LifeStageAnswersMap
  for (const stage of LIFE_STAGES) {
    result[stage.id] = { schoolName: '', values: {} }
  }
  return result
}

export function createInitialFormData(): FormData {
  return {
    profile: {
      furigana: '',
      name: '',
      nickname: '',
      birthDate: '',
      movieReason: '',
      dailyLife: '',
    },
    family: [createEmptyFamilyMember(), createEmptyFamilyMember(), createEmptyFamilyMember(), createEmptyFamilyMember()],
    lifeStages: createInitialLifeStageAnswers(),
  }
}
