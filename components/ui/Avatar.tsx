// Avatar de header — foto se houver, senão iniciais. Antes o header do
// cliente simplesmente não mostrava nada sem avatar_url; o do admin nem
// tinha avatar, só o e-mail em texto puro.
export default function Avatar({ name, imageUrl, size = 28 }: { name: string; imageUrl?: string | null; size?: number }) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '1.5px solid rgba(255,255,255,0.18)',
          flexShrink: 0,
        }}
      />
    )
  }

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?'

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(30,167,232,0.22)',
        color: '#8FD4FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Space Mono', monospace",
        fontSize: size * 0.38,
        fontWeight: 700,
        border: '1.5px solid rgba(255,255,255,0.14)',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}
