// utils/streak.ts
import { createClient } from '@/utils/supabase/client'

export async function updateStreak() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('streak, last_login_at')
    .eq('user_id', user.id)
    .single()

  if (!profile) return

  // 날짜만 YYYY-MM-DD 형식으로 비교
  const today = new Date().toISOString().slice(0, 10)
  const lastLogin = profile.last_login_at
    ? String(profile.last_login_at).slice(0, 10)
    : null

  // 오늘 이미 했으면 스킵
  if (lastLogin === today) return

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  const isConsecutive = lastLogin === yesterdayStr

  await supabase
    .from('profiles')
    .update({
      streak: isConsecutive ? profile.streak + 1 : 1,
      last_login_at: today
    })
    .eq('user_id', user.id)
}