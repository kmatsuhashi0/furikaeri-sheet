import { useEffect, useRef, useState } from 'react'
import type { FormData } from '../types'
import { createInitialFormData } from '../data/initialData'

const STORAGE_KEY = 'furikaeri-sheet:draft:v1'

function loadDraft(): { data: FormData; loadError: string | null } {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return { data: createInitialFormData(), loadError: null }
  }
  try {
    const parsed = JSON.parse(raw) as Partial<FormData>
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('invalid shape')
    }
    const initial = createInitialFormData()
    const data: FormData = {
      profile: { ...initial.profile, ...parsed.profile },
      family: Array.isArray(parsed.family) ? parsed.family : initial.family,
      lifeStages: { ...initial.lifeStages, ...parsed.lifeStages },
    }
    return { data, loadError: null }
  } catch {
    return {
      data: createInitialFormData(),
      loadError: '保存されていた入力内容の読み込みに失敗したため、白紙の状態で開きました。',
    }
  }
}

export function useDraftStorage() {
  const initial = useRef(loadDraft())
  const [formData, setFormData] = useState<FormData>(initial.current.data)
  const [loadError] = useState<string | null>(initial.current.loadError)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
      setSaveError(null)
    } catch {
      setSaveError('入力内容の自動保存に失敗しました。端末の空き容量をご確認ください。')
    }
  }, [formData])

  return { formData, setFormData, loadError, saveError }
}
