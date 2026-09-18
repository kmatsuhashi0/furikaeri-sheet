interface PrintFieldProps {
  label: string
  value: string
}

export function PrintField({ label, value }: PrintFieldProps) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <span className="print-value">{value}</span>
    </div>
  )
}

export function PrintTextarea({ label, value }: PrintFieldProps) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <span className="print-textarea-value">{value}</span>
    </div>
  )
}
