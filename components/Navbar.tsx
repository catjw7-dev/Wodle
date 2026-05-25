// components/Navbar.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Profile = {
  userName: string
  Lv: number
  coin: number
}

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    let userId: string

    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      userId = user.id

      const { data } = await supabase
        .from('profiles')
        .select('userName, Lv, coin')
        .eq('user_id', user.id)
        .single()
      setProfile(data)

      supabase
        .channel('navbar-profile')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            setProfile(prev => prev ? {
              ...prev,
              coin: payload.new.coin,
              Lv: payload.new.Lv,
            } : prev)
          }
        )
        .subscribe()
    }

    fetchProfile()

    return () => {
      supabase.channel('navbar-profile').unsubscribe()
    }
  }, [])

  if (!profile) return null

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid #eee' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>Lv.{profile.Lv}</span>
        <span>{profile.userName ?? '사용자'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>🪙 {profile.coin}</span>
        <button onClick={() => router.push(`/${params.id}/home`)}>홈</button>
        <button onClick={() => router.push(`/${params.id}/settings`)}>설정</button>
      </div>
    </nav>
  )
}