import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  hint?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, hint, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="form-field__hint">{hint}</p>}
    </div>
  )
}
