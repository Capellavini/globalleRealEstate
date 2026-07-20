// Ícones de linha simples (sem lib externa — disco da máquina de dev está
// crítico, evitar instalar dependência nova só por isso). Estilo outline,
// 24x24, currentColor — troca os emojis (🛏📐🏠💬📈) por algo mais "produto".

type IconProps = { size?: number; style?: React.CSSProperties }

const common = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function BedIcon({ size = 15, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common} style={style} aria-hidden="true">
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
      <path d="M3 18v2M21 18v2" />
      <path d="M5 10V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
    </svg>
  )
}

export function AreaIcon({ size = 15, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common} style={style} aria-hidden="true">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v3" />
      <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

export function HomeIcon({ size = 15, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common} style={style} aria-hidden="true">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  )
}

export function ChatIcon({ size = 15, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common} style={style} aria-hidden="true">
      <path d="M4 4.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H9.5L5 20v-4H4a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1z" />
    </svg>
  )
}

export function TrendingUpIcon({ size = 15, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common} style={style} aria-hidden="true">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  )
}

export function SendIcon({ size = 16, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common} style={style} aria-hidden="true">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  )
}
