'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [username, setUsername] = useState('사용자')
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('userName').eq('user_id', user.id).single()
      setUsername(profile?.userName ?? '사용자')
    }
    getUser()
  }, [])

  return (
    <div>
      <h1>안녕하세요, {username}님!</h1>
      <a href="/login">로그인</a>
      <a href="/signup">회원가입</a>
    </div>
  )
}