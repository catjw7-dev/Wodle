'use client'

import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewWordbookPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  async function handleCreate() {
    if (!title.trim()) {
      setError('제목을 입력해주세요!')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('wordbooks')
      .insert({ title, description, user_id: user.id })
      .select()
      .single()

    if (error) {
      setError(error.message)
      return
    }

    router.push(`/${params.id}/wordbook/${data.id}`)
  }

  return (
    <div>
      <h1>단어장 만들기</h1>
      <input placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} />
      <input placeholder="설명 (선택)" value={description} onChange={e => setDescription(e.target.value)} />
      {error && <p>{error}</p>}
      <button onClick={handleCreate}>완성</button>
    </div>
  )
}