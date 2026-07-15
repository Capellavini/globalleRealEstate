export default function Badge({
  bg,
  fg,
  children,
}: {
  bg: string
  fg: string
  children: React.ReactNode
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: bg,
        color: fg,
        borderRadius: 999,
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
