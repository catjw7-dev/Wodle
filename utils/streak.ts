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

  const now = new Date()
  const today = now.toDateString()
  const lastLogin = profile.last_login_at ? new Date(profile.last_login_at).toDateString() : null

  if (lastLogin === today) return

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isConsecutive = lastLogin === yesterday.toDateString()

  await supabase
    .from('profiles')
    .update({
      streak: isConsecutive ? profile.streak + 1 : 1,
      last_login_at: now.toISOString()
    })
    .eq('user_id', user.id)
}