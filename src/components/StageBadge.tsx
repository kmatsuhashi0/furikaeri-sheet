interface StageBadgeProps {
  top: string
  bottom: string
  equalWeight?: boolean
}

export function StageBadge({ top, bottom, equalWeight }: StageBadgeProps) {
  return (
    <div className={`stage-badge${equalWeight ? ' stage-badge--equal' : ''}`}>
      <span className="stage-badge__top">{top}</span>
      <span className="stage-badge__divider" />
      <span className="stage-badge__bottom">{bottom}</span>
    </div>
  )
}
