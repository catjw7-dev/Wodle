// utils/coin.ts
import { createClient } from '@/utils/supabase/client'

export async function awardCoins(correctCount: number): Promise<{ earned: number; bonus: number }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { earned: 0, bonus: 0 }

  const base = correctCount

  const bonusCount = Math.floor(correctCount / 5)
  let bonus = 0
  for (let i = 0; i < bonusCount; i++) {
    bonus += Math.floor(Math.random() * 5) + 1
  }

  const total = base + bonus
  if (total === 0) return { earned: 0, bonus: 0 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('coin')
    .eq('user_id', user.id)
    .single()

  if (!profile) return { earned: 0, bonus: 0 }

  await supabase
    .from('profiles')
    .update({ coin: profile.coin + total })
    .eq('user_id', user.id)

  return { earned: base, bonus }
}