'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateOwnProfile } from '@/app/actions/profile'
import { COUNTRY_NAMES, countryFlag, LANGUAGE_LABELS, type Profile } from '@/lib/portfolio/types'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 8,
  fontSize: 14.5,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#0B1230',
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
      <span>
        {label}
        {optional && <span style={{ fontWeight: 400, color: 'rgba(11,18,48,0.5)' }}> — opcional</span>}
      </span>
      {children}
    </label>
  )
}

export default function ProfileForm({
  profile,
  email,
  mode,
}: {
  profile: Profile
  email: string
  mode: 'completar' | 'editar'
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleAvatar(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${profile.id}/avatar-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, file)
      if (error) throw new Error(error.message)
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Erro no upload da foto.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <form action={updateOwnProfile} style={{ display: 'grid', gap: 16 }}>
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="avatar_url" value={avatarUrl} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            flexShrink: 0,
            background: avatarUrl
              ? `url(${avatarUrl}) center/cover no-repeat`
              : 'linear-gradient(135deg, #0E1530, #131B38)',
            display: 'grid',
            placeItems: 'center',
            color: '#EDF1F7',
            fontWeight: 800,
            fontSize: 22,
          }}
        >
          {!avatarUrl && (profile.full_name?.[0] ?? '?').toUpperCase()}
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            Foto <span style={{ fontWeight: 400, color: 'rgba(11,18,48,0.5)' }}>— opcional</span>
          </span>
          <input ref={fileRef} type="file" accept="image/*" disabled={uploading} onChange={(e) => handleAvatar(e.target.files)} style={{ fontSize: 13 }} />
          {uploading && <span style={{ fontSize: 12, color: 'rgba(11,18,48,0.6)' }}>Enviando…</span>}
          {uploadError && <span style={{ fontSize: 12, color: '#A03030' }}>{uploadError}</span>}
        </div>
      </div>

      <Field label="Nome completo">
        <input name="full_name" type="text" required defaultValue={profile.full_name} style={inputStyle} />
      </Field>

      <Field label="E-mail">
        <input type="email" value={email} readOnly disabled style={{ ...inputStyle, background: 'rgba(11,18,48,0.05)', color: 'rgba(11,18,48,0.55)' }} />
      </Field>

      <Field label="Telefone" optional>
        <input name="phone" type="tel" defaultValue={profile.phone ?? ''} placeholder="+351 …" style={inputStyle} />
      </Field>

      <Field label="Empresa">
        <input name="company" type="text" required defaultValue={profile.company ?? ''} style={inputStyle} />
      </Field>

      <Field label="País de residência">
        <select name="residence_country" required defaultValue={profile.residence_country ?? ''} style={inputStyle}>
          <option value="" disabled>
            selecione…
          </option>
          {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
            <option key={code} value={code}>
              {countryFlag(code)} {name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Idioma preferido">
        <select name="preferred_language" required defaultValue={profile.preferred_language ?? ''} style={inputStyle}>
          <option value="" disabled>
            selecione…
          </option>
          {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        disabled={uploading}
        style={{
          padding: '13px 16px',
          border: 'none',
          borderRadius: 8,
          background: '#070B24',
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: uploading ? 'wait' : 'pointer',
        }}
      >
        {mode === 'completar' ? 'Salvar e ver as opções' : 'Salvar perfil'}
      </button>
    </form>
  )
}
