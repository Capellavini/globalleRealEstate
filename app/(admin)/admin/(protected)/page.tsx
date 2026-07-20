import { redirect } from 'next/navigation'

// Clientes é a home do admin (Passo 3 da consolidação).
export default function AdminIndexPage() {
  redirect('/admin/clientes')
}
