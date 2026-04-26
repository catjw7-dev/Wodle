import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) redirect(`/${user.id}/home`)

  return (
    <div>
      <h1>Wodle</h1>
      <a href="/login">로그인</a>
      <a href="/signup">회원가입</a>
    </div>
  )
}