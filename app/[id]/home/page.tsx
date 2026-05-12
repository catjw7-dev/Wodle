import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.id !== id) redirect(`/${user.id}/home`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('userName, streak')
    .eq('user_id', user.id)
    .single()

  // wrong_count > 0 인 단어가 있는 단어장 목록
  const { data: reviewWordbooks } = await supabase
    .from('wordbooks')
    .select('id, title, words(id)')
    .eq('user_id', user.id)
    .gt('words.wrong_count', 0)

  const filteredReview = reviewWordbooks?.filter(wb => wb.words.length > 0) ?? []

  return (
    <div>
      <h1>안녕하세요, {profile?.userName ?? '사용자'}님!</h1>
      <p>🔥 {profile?.streak ?? 0}일 연속 학습!</p>
      <a href={`/${id}/wordbook/new`}>새 단어장 만들기</a>

      {filteredReview.length > 0 && (
        <div>
          <h2>복습할 단어장</h2>
          <ul>
            {filteredReview.map(wb => (
              <li key={wb.id}>
                <a href={`/${id}/wordbook/${wb.id}/review`}>{wb.title} ({wb.words.length}개)</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}