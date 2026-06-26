import Image from 'next/image'
import Link from 'next/link'

// Globalle wordmark (globe + lettering), extracted from the brand deck.
// Native ratio 924×256 ≈ 3.61:1
export default function Logo({
  height = 30,
  href,
  priority = false,
}: {
  height?: number
  href?: string
  priority?: boolean
}) {
  const img = (
    <Image
      src="/globalle-logo.png"
      alt="Globalle"
      width={Math.round(height * 3.61)}
      height={height}
      priority={priority}
      style={{ height, width: 'auto', display: 'block' }}
    />
  )
  if (href) {
    return (
      <Link href={href} style={{ display: 'inline-flex', flexShrink: 0 }} aria-label="Globalle — início">
        {img}
      </Link>
    )
  }
  return img
}
