interface OutlineItem {
  index: number
  label: string
}

interface OutlineNavProps {
  items: OutlineItem[]
  currentIndex: number
  onSelect: (index: number) => void
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function OutlineNav({ items, currentIndex, onSelect, isOpen, onClose, onConfirm }: OutlineNavProps) {
  return (
    <>
      {isOpen && <div className="outline-backdrop" onClick={onClose} />}
      <aside className={`outline-nav${isOpen ? ' outline-nav--open' : ''}`} aria-label="ページ一覧">
        <div className="outline-nav__head">
          <span className="outline-nav__title">目次</span>
          <button type="button" className="outline-nav__close" onClick={onClose} aria-label="目次を閉じる">
            ×
          </button>
        </div>
        <ol className="outline-nav__list">
          {items.map((item) => (
            <li key={item.index}>
              <button
                type="button"
                className={`outline-nav__item${item.index === currentIndex ? ' outline-nav__item--current' : ''}`}
                onClick={() => onSelect(item.index)}
                aria-current={item.index === currentIndex ? 'page' : undefined}
              >
                <span className="outline-nav__num">{item.index + 1}</span>
                <span className="outline-nav__label">{item.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="outline-nav__confirm" onClick={onConfirm}>
          入力内容を確認する
        </button>
      </aside>
    </>
  )
}
