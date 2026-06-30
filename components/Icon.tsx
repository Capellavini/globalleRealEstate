import React from 'react'

// Line-art icon set (24×24, currentColor stroke). Replaces emoji throughout.
const PATHS: Record<string, React.ReactNode> = {
  // value props
  curation: <><path d="M12 3.5l1.7 4.9 4.9 1.6-4.9 1.7L12 16.5l-1.7-4.8L5.4 10l4.9-1.6L12 3.5z" /><path d="M18.5 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" /></>,
  cultural: <><path d="m12 3 9 4.8-9 4.8L3 7.8 12 3z" /><path d="m3 12.5 9 4.8 9-4.8" /></>,
  experience: <><path d="M8 4h8v3.5a4 4 0 0 1-8 0V4z" /><path d="M8 5.2H5v1.6a3 3 0 0 0 3 3M16 5.2h3v1.6a3 3 0 0 1-3 3" /><path d="M12 11.5V15M9.5 20h5M10 15.5h4l1 4.5H9l1-4.5z" /></>,
  community: <><circle cx="6" cy="7" r="2.2" /><circle cx="18" cy="7" r="2.2" /><circle cx="12" cy="17.5" r="2.2" /><path d="M7.6 8.7 11 15.5M16.4 8.7 13 15.5M8.2 7h7.6" /></>,
  // products
  newsletter: <><rect x="3" y="4.5" width="18" height="15" rx="2" /><path d="M7 9h10M7 12.5h10M7 16h6" /></>,
  advisory: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2z" /></>,
  // community
  calendar: <><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /><circle cx="12" cy="14.5" r="1.4" fill="currentColor" stroke="none" /></>,
  share: <><circle cx="18" cy="5.5" r="2.6" /><circle cx="6" cy="12" r="2.6" /><circle cx="18" cy="18.5" r="2.6" /><path d="m8.3 10.7 7.4-3.9M8.3 13.3l7.4 3.9" /></>,
  // contact
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.2 1.9" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18" /></>,
  // utility
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  arrowUpRight: <><path d="M7 17 17 7M8.5 7H17v8.5" /></>,
  check: <><path d="M5 12.5l4 4L19 7" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  minus: <><path d="M5 12h14" /></>,
}

export type IconName = keyof typeof PATHS

export default function Icon({
  name,
  size = 24,
  strokeWidth = 1.6,
  style,
}: {
  name: IconName
  size?: number
  strokeWidth?: number
  style?: React.CSSProperties
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
