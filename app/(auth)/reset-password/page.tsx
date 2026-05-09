'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleReset() {
    if (!email.trim()) {
      setError('이메일을 입력해주세요!')
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://wodle.vercel.app/update-password'
    })
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  if (sent) return <p>이메일을 확인해주세요!</p>

  return (
    <div>
      <h1>비밀번호 재설정</h1>
      <input placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} />
      {error && <p>{error}</p>}
      <button onClick={handleReset}>재설정 메일 보내기</button>
      <a href="/login">로그인으로 돌아가기</a>
    </div>
  )
}