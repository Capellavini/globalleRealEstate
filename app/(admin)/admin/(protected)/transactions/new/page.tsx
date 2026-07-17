import Link from 'next/link'
import { createTransaction } from '@/app/actions/transactions'
import { THESIS_LABELS, type TransactionThesis } from '@/lib/admin/types'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 8,
  fontSize: 15,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#0B1230',
}

export default function NewTransactionPage() {
  return (
    <div style={{ maxWidth: 520 }}>
      <Link href="/admin" style={{ fontSize: 13, color: 'rgba(11,18,48,0.60)', textDecoration: 'none' }}>
        ← Voltar
      </Link>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '12px 0 6px' }}>Nova transação</h1>
      <p style={{ fontSize: 14, color: 'rgba(11,18,48,0.60)', marginBottom: 24 }}>
        Ao salvar, as 4 etapas padrão da tese escolhida são criadas automaticamente.
      </p>

      <form
        action={createTransaction}
        style={{
          background: '#fff',
          border: '1px solid rgba(11,18,48,0.10)',
          borderRadius: 12,
          padding: 24,
          display: 'grid',
          gap: 16,
        }}
      >
        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
          Nome do cliente
          <input name="client_name" type="text" required style={inputStyle} />
        </label>

        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
          Tese
          <select name="thesis" required defaultValue="" style={inputStyle}>
            <option value="" disabled>
              Selecione a tese…
            </option>
            {(Object.keys(THESIS_LABELS) as TransactionThesis[]).map((key) => (
              <option key={key} value={key}>
                {THESIS_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
          País do processo
          <select name="process_country" required defaultValue="PT" style={inputStyle}>
            <option value="PT">🇵🇹 Portugal</option>
            <option value="BR">🇧🇷 Brasil</option>
          </select>
          <span style={{ fontWeight: 400, fontSize: 12, color: 'rgba(11,18,48,0.55)' }}>
            Define as etapas do processo de compra (Proposta → … → Pós-compra).
          </span>
        </label>

        <button
          type="submit"
          style={{
            padding: '12px 14px',
            border: 'none',
            borderRadius: 8,
            background: '#070B24',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          Criar transação
        </button>
      </form>
    </div>
  )
}
