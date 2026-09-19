import { PrintField, PrintTextarea } from './PrintField'
import { calculateAge } from '../../utils/age'
import type { FormData } from '../../types'

interface PrintBasicInfoPageProps {
  formData: FormData
}

export function PrintBasicInfoPage({ formData }: PrintBasicInfoPageProps) {
  const { profile, family } = formData
  const { age } = calculateAge(profile.birthDate)
  const filledFamily = family.filter(
    (member) => member.relationship.trim() || member.nameFurigana.trim() || member.birthYear.trim() || member.note.trim(),
  )

  return (
    <div className="page print-basic">
      <section className="sheet-section">
        <h2 className="sheet-section__title">基本情報</h2>
        <div className="info-card">
          <div className="name-group">
            <div className="name-group__item name-group__item--name">
              <label>お名前</label>
              <span className="print-value">{profile.name}</span>
            </div>
            <div className="name-group__item name-group__item--furigana">
              <label>ふりがな</label>
              <span className="print-value">{profile.furigana}</span>
            </div>
          </div>
          <div className="info-card__row">
            <PrintField label="あだ名（小さな頃に呼ばれていた名前）" value={profile.nickname} />
            <div className="form-field">
              <label>生年月日</label>
              <div className="birthdate-row">
                <span className="print-value print-value--birthdate">{profile.birthDate}</span>
                {age !== null && <span className="age-display">現在 {age} 歳</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sheet-section">
        <h2 className="sheet-section__title">ライフストーリームービーについて</h2>
        <PrintTextarea label="ライフストーリームービーを制作したいと思ったきっかけを教えてください。" value={profile.movieReason} />
      </section>

      <section className="sheet-section">
        <h2 className="sheet-section__title">日常生活について</h2>
        <PrintTextarea label="趣味や生きがいなど、日々の生活について簡単に教えてください。" value={profile.dailyLife} />
      </section>

      <section className="sheet-section">
        <h2 className="sheet-section__title">家族について</h2>
        {filledFamily.length === 0 ? (
          <p className="review-empty">入力はありません。</p>
        ) : (
          <ul className="print-family-list">
            {filledFamily.map((member) => (
              <li className="print-family-card" key={member.id}>
                <div className="print-family-row">
                  <div className="print-family-cell">
                    <span className="family-row__label">続柄</span>
                    <span className="print-value print-value--compact">{member.relationship}</span>
                  </div>
                  <div className="print-family-cell">
                    <span className="family-row__label">お名前（ふりがな）</span>
                    <span className="print-value print-value--compact">{member.nameFurigana}</span>
                  </div>
                  <div className="print-family-cell">
                    <span className="family-row__label">生まれた年</span>
                    <span className="print-value print-value--compact">{member.birthYear}</span>
                  </div>
                </div>
                {member.note.trim() && (
                  <div className="print-family-cell print-family-note">
                    <span className="family-row__label">備考</span>
                    <span className="print-value print-value--compact">{member.note}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
