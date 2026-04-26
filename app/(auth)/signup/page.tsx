'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
      if (!email || !password || !username) {
        setError('이메일, 비밀번호, 닉네임을 모두 입력하세요')
        return
    }
    if (error) {
      setError(error.message)
      return
    }
    await supabase.from('profiles').update({ userName: username }).eq('user_id', data.user!.id)
    router.push('/')
  }

  return (
    <div>
      <h1>회원가입</h1>
      <input placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="비밀번호" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <input placeholder="닉네임" value={username} onChange={e => setUsername(e.target.value)} />
      {error && <p>{error}</p>}
       <button onClick={handleSignup} disabled={loading}>
      {loading ? '회원가입 중...' : '회원가입'}
      </button>
      <a href="/login">로그인</a>
    </div>
  )
}