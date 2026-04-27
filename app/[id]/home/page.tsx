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
    .select('userName')
    .eq('user_id', user.id)
    .single()

  return (
    <div>
      <h1>안녕하세요, {profile?.userName ?? '사용자'}님!</h1>
      <a href={`/${id}/wordbook/new`}>새 단어장 만들기</a>
    </div>
  )
}