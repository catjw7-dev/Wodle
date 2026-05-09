'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleUpdate() {
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요!')
      return
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      return
    }
    router.push('/')
  }

  return (
    <div>
      <h1>새 비밀번호 설정</h1>
      <input
        type="password"
        placeholder="새 비밀번호"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {error && <p>{error}</p>}
      <button onClick={handleUpdate}>변경하기</button>
    </div>
  )
}