'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Profile = {
  userName: string
  Lv: number
  coin: number
}

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('userName, Lv, coin')
        .eq('user_id', user.id)
        .single()
      setProfile(data)
    }
    fetchProfile()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!profile) return null

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid #eee' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>Lv.{profile.Lv}</span>
        <span>{profile.userName ?? '사용자'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>🪙 {profile.coin}</span>
        <button onClick={() => router.push('/settings')}>설정</button>
        <button onClick={handleLogout}>로그아웃</button>
      </div>
    </nav>
  )
}