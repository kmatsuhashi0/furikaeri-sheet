import { useEffect, useRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

type AutoTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function AutoTextarea({ value, onChange, className, ...rest }: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const resize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  useEffect(() => {
    resize()
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(event) => {
        onChange?.(event)
      }}
      className={`auto-textarea ${className ?? ''}`.trim()}
      rows={1}
      {...rest}
    />
  )
}
