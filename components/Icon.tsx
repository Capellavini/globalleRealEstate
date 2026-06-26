import React from 'react'

// Line-art icon set (24×24, currentColor stroke). Replaces emoji throughout.
const PATHS: Record<string, React.ReactNode> = {
  // values
  ethics: <><path d="M12 4v16M8 20h8" /><path d="M6 7h12" /><path d="M6 7l-3 6a3 3 0 0 0 6 0l-3-6z" /><path d="M18 7l-3 6a3 3 0 0 0 6 0l-3-6z" /><path d="M12 4 6 7M12 4l6 3" /></>,
  transform: <><path d="M21 12a9 9 0 1 1-2.6-6.3" /><path d="M21 4v5h-5" /></>,
  innovation: <><path d="M9.5 18h5M10.5 21h3" /><path d="M12 3a6 6 0 0 0-3.8 10.6c.7.6 1.3 1.4 1.3 2.4h5c0-1 .6-1.8 1.3-2.4A6 6 0 0 0 12 3z" /></>,
  listen: <><path d="M3 12h1.5M19.5 12H21" /><path d="M7 8.5v7M10.5 5v14M13.5 5v14M17 8.5v7" /></>,
  learn: <><path d="M3 4.5h6.5a2.5 2.5 0 0 1 2.5 2.5v13a2 2 0 0 0-2-2H3V4.5z" /><path d="M21 4.5h-6.5A2.5 2.5 0 0 0 12 7v13a2 2 0 0 1 2-2h7V4.5z" /></>,
  trust: <><path d="M12 3 5 5.8v5.2c0 4 2.9 7 7 8 4.1-1 7-4 7-8V5.8L12 3z" /><path d="m9 11.5 2 2 4-4" /></>,
  // mission / vision
  mission: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  vision: <><circle cx="12" cy="12" r="6.5" /><circle cx="12" cy="12" r="2.3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" /></>,
  // value props
  curation: <><path d="M12 3.5l1.7 4.9 4.9 1.6-4.9 1.7L12 16.5l-1.7-4.8L5.4 10l4.9-1.6L12 3.5z" /><path d="M18.5 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" /></>,
  cultural: <><path d="m12 3 9 4.8-9 4.8L3 7.8 12 3z" /><path d="m3 12.5 9 4.8 9-4.8" /></>,
  experience: <><path d="M8 4h8v3.5a4 4 0 0 1-8 0V4z" /><path d="M8 5.2H5v1.6a3 3 0 0 0 3 3M16 5.2h3v1.6a3 3 0 0 1-3 3" /><path d="M12 11.5V15M9.5 20h5M10 15.5h4l1 4.5H9l1-4.5z" /></>,
  community: <><circle cx="6" cy="7" r="2.2" /><circle cx="18" cy="7" r="2.2" /><circle cx="12" cy="17.5" r="2.2" /><path d="M7.6 8.7 11 15.5M16.4 8.7 13 15.5M8.2 7h7.6" /></>,
  // products
  newsletter: <><rect x="3" y="4.5" width="18" height="15" rx="2" /><path d="M7 9h10M7 12.5h10M7 16h6" /></>,
  podcast: <><rect x="9" y="2.5" width="6" height="10.5" rx="3" /><path d="M5.5 10.5a6.5 6.5 0 0 0 13 0" /><path d="M12 17v4M8.5 21h7" /></>,
  advisory: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2z" /></>,
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
