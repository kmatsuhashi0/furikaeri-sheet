import type { FamilyMember } from '../types'
import { createEmptyFamilyMember } from '../data/initialData'

interface FamilySectionProps {
  members: FamilyMember[]
  onChange: (members: FamilyMember[]) => void
}

const RELATIONSHIP_PLACEHOLDERS = ['例：父', '例：母', '例：配偶者']

function getRelationshipPlaceholder(index: number): string {
  return RELATIONSHIP_PLACEHOLDERS[index] ?? '例：'
}

export function FamilySection({ members, onChange }: FamilySectionProps) {
  const updateMember = (id: string, patch: Partial<FamilyMember>) => {
    onChange(members.map((member) => (member.id === id ? { ...member, ...patch } : member)))
  }

  const removeMember = (id: string) => {
    onChange(members.filter((member) => member.id !== id))
  }

  const addMember = () => {
    onChange([...members, createEmptyFamilyMember()])
  }

  return (
    <div className="family-section">
      <ul className="family-list">
        {members.map((member, index) => (
          <li className="family-row" key={member.id}>
            <button
              type="button"
              className="family-row__remove"
              onClick={() => removeMember(member.id)}
              aria-label={`${member.relationship || 'この行'}を削除`}
            >
              ×
            </button>
            <div className="family-row__field family-row__field--relationship">
              <span className="family-row__label">続柄</span>
              <input
                type="text"
                value={member.relationship}
                onChange={(event) => updateMember(member.id, { relationship: event.target.value })}
                placeholder={getRelationshipPlaceholder(index)}
              />
            </div>
            <div className="family-row__field family-row__field--name">
              <span className="family-row__label">お名前（ふりがな）</span>
              <input
                type="text"
                value={member.nameFurigana}
                onChange={(event) => updateMember(member.id, { nameFurigana: event.target.value })}
              />
            </div>
            <div className="family-row__field family-row__field--birthyear">
              <span className="family-row__label">生まれた年</span>
              <input
                type="text"
                inputMode="numeric"
                value={member.birthYear}
                onChange={(event) => updateMember(member.id, { birthYear: event.target.value })}
                placeholder="例：1960年"
              />
            </div>
            <div className="family-row__field family-row__field--note">
              <span className="family-row__label">備考</span>
              <input
                type="text"
                value={member.note}
                onChange={(event) => updateMember(member.id, { note: event.target.value })}
              />
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="family-section__add" onClick={addMember}>
        ＋ 家族・親族を追加
      </button>
    </div>
  )
}
