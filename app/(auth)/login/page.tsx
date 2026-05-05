'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()
    const [loading, setLoading] = useState(false)

    async function handleLogin() {
    if (!email || !password) {
        setError('이메일과 비밀번호를 입력하세요')
        return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
        setError(error.message)
        return
    }

    router.push('/')
    }

  return (
    <div>
      <h1>로그인</h1>
      <input placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="비밀번호" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p>{error}</p>}
      <button onClick={handleLogin} disabled={loading}>
      {loading ? '로그인 중...' : '로그인'}
      </button>
      <a href="/signup">회원가입</a>
      <a href="/reset-password">비밀번호를 잊으셨나요? 재설정 하러 가기</a>
    </div>
  )
}