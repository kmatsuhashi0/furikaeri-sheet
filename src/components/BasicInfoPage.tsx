import { AutoTextarea } from './AutoTextarea'
import { FamilySection } from './FamilySection'
import { FormField } from './FormField'
import { calculateAge } from '../utils/age'
import type { FormData } from '../types'

interface BasicInfoPageProps {
  formData: FormData
  setFormData: (updater: (prev: FormData) => FormData) => void
}

export function BasicInfoPage({ formData, setFormData }: BasicInfoPageProps) {
  const { profile, family } = formData
  const { age, error: ageError } = calculateAge(profile.birthDate)

  const updateProfile = <K extends keyof FormData['profile']>(key: K, value: FormData['profile'][K]) => {
    setFormData((prev) => ({ ...prev, profile: { ...prev.profile, [key]: value } }))
  }

  return (
    <div className="page">
      <section className="sheet-section">
        <h2 className="sheet-section__title">基本情報</h2>
        <div className="info-card">
          <div className="name-group">
            <div className="name-group__item name-group__item--name">
              <label htmlFor="name">お名前</label>
              <input
                id="name"
                type="text"
                value={profile.name}
                onChange={(event) => updateProfile('name', event.target.value)}
              />
            </div>
            <div className="name-group__item name-group__item--furigana">
              <label htmlFor="furigana">ふりがな</label>
              <input
                id="furigana"
                type="text"
                value={profile.furigana}
                onChange={(event) => updateProfile('furigana', event.target.value)}
              />
            </div>
          </div>
          <div className="info-card__row">
            <FormField label="あだ名（小さな頃に呼ばれていた名前）" htmlFor="nickname">
              <input
                id="nickname"
                type="text"
                value={profile.nickname}
                onChange={(event) => updateProfile('nickname', event.target.value)}
              />
            </FormField>
            <FormField label="生年月日" htmlFor="birthDate">
              <div className="birthdate-row">
                <input
                  id="birthDate"
                  type="date"
                  value={profile.birthDate}
                  onChange={(event) => updateProfile('birthDate', event.target.value)}
                />
                {age !== null && <span className="age-display">現在 {age} 歳</span>}
              </div>
              {ageError && <p className="field-error">{ageError}</p>}
            </FormField>
          </div>
        </div>
      </section>

      <section className="sheet-section">
        <h2 className="sheet-section__title">ライフストーリームービーについて</h2>
        <FormField label="ライフストーリームービーを制作したいと思ったきっかけを教えてください。" htmlFor="movieReason">
          <AutoTextarea
            id="movieReason"
            value={profile.movieReason}
            onChange={(event) => updateProfile('movieReason', event.target.value)}
          />
        </FormField>
      </section>

      <section className="sheet-section">
        <h2 className="sheet-section__title">日常生活について</h2>
        <FormField
          label="趣味や生きがいなど、日々の生活について簡単に教えてください。"
          htmlFor="dailyLife"
          hint="例：ガーデニングが好き／家ではよく映画を見ている／定期的にウォーキングをしている　など"
        >
          <AutoTextarea
            id="dailyLife"
            value={profile.dailyLife}
            onChange={(event) => updateProfile('dailyLife', event.target.value)}
          />
        </FormField>
      </section>

      <section className="sheet-section">
        <h2 className="sheet-section__title">家族について</h2>
        <p className="sheet-section__lede">家族構成や、人生を語る上で重要な方がいらっしゃいましたらご記入ください。</p>
        <FamilySection
          members={family}
          onChange={(members) => setFormData((prev) => ({ ...prev, family: members }))}
        />
      </section>
    </div>
  )
}
