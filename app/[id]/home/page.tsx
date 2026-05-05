import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // ✅ 로그인 확인
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // ✅ URL id랑 로그인 유저 다르면 리다이렉트
  if (user.id !== id) {
    redirect(`/${user.id}/home`)
  }

  // 🔥 streak 업데이트 (DB에서 KST 기준으로 처리됨)
  const { error: streakError } = await supabase.rpc('update_streak', {
    p_user_id: user.id
  })

  if (streakError) {
    console.error('streak update error:', streakError)
  }

  // ✅ 프로필 가져오기
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('userName, streak')
    .eq('user_id', user.id)
    .single()

  if (profileError) {
    console.error('profile fetch error:', profileError)
  }

  return (
    <div>
      <h1>안녕하세요, {profile?.userName ?? '사용자'}님!</h1>

      <p>
        🔥 {profile?.streak ?? 0}일 연속 출석!
      </p>

      <div>
        <a href={`/${id}/wordbook/new`}>
          📘 새 단어장 만들기
        </a>
      </div>
    </div>
  )
}