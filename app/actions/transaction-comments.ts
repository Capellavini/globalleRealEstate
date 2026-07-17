'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/supabase/roles'

// Comentário na transação — RLS: participante só nas suas; equipe em todas.
export async function addTransactionComment(formData: FormData) {
  const { user } = await requireUser()
  const transaction_id = String(formData.get('transaction_id'))
  const body = String(formData.get('body') ?? '').trim()
  if (!body) return

  const supabase = createClient()
  const { error } = await supabase
    .from('transaction_comments')
    .insert({ transaction_id, author_id: user.id, body })
  if (error) throw new Error(`Erro ao comentar: ${error.message}`)

  const path = String(formData.get('revalidate') ?? '')
  if (path) revalidatePath(path)
}
