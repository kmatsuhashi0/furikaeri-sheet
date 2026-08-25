export interface AgeResult {
  age: number | null
  error: string | null
}

export function calculateAge(birthDateISO: string, today: Date = new Date()): AgeResult {
  if (!birthDateISO) {
    return { age: null, error: null }
  }

  const birthDate = new Date(birthDateISO)
  if (Number.isNaN(birthDate.getTime())) {
    return { age: null, error: '生年月日を正しく入力してください。' }
  }

  if (birthDate.getTime() > today.getTime()) {
    return { age: null, error: '生年月日が未来の日付になっています。' }
  }

  let age = today.getFullYear() - birthDate.getFullYear()
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  if (!hasHadBirthdayThisYear) {
    age -= 1
  }

  return { age, error: null }
}
