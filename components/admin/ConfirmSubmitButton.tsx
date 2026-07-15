'use client'

// Submit button that asks for confirmation — for destructive actions
// (delete transaction/step/document) inside server-action forms.
export default function ConfirmSubmitButton({
  message,
  children,
  style,
}: {
  message: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault()
      }}
      style={{
        background: 'none',
        border: '1px solid rgba(194,61,61,0.35)',
        borderRadius: 6,
        color: '#A03030',
        padding: '5px 10px',
        fontSize: 12,
        fontFamily: 'inherit',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
