interface StageBadgeProps {
  top: string
  bottom: string
}

export function StageBadge({ top, bottom }: StageBadgeProps) {
  return (
    <div className="stage-badge">
      <span className="stage-badge__top">{top}</span>
      <span className="stage-badge__bottom">{bottom}</span>
    </div>
  )
}
