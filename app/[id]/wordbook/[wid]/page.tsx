'use client'

import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Word = {
  id: string
  term: string
  definition: string
}

export default function WordbookPage() {
  const [words, setWords] = useState<Word[]>([])
  const [term, setTerm] = useState('')
  const [definition, setDefinition] = useState('')
  const [error, setError] = useState('')
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchWords()
  }, [])

  async function fetchWords() {
    const { data } = await supabase
      .from('words')
      .select('*')
      .eq('wordbook_id', params.wid)
    setWords(data ?? [])
  }

  async function handleAdd() {
    if (!term.trim() || !definition.trim()) {
      setError('단어와 뜻을 입력해주세요!')
      return
    }

    const { error } = await supabase
      .from('words')
      .insert({ term, definition, wordbook_id: params.wid })

    if (error) {
      setError(error.message)
      return
    }

    setTerm('')
    setDefinition('')
    setError('')
    fetchWords()
  }

  async function handleDelete(wordId: string) {
    await supabase.from('words').delete().eq('id', wordId)
    fetchWords()
  }

  return (
    <div>
      <h1>단어장</h1>
      <div>
        <input placeholder="단어" value={term} onChange={e => setTerm(e.target.value)} />
        <input placeholder="뜻" value={definition} onChange={e => setDefinition(e.target.value)} />
        {error && <p>{error}</p>}
        <button onClick={handleAdd}>추가</button>
      </div>
      <ul>
        {words.map(word => (
          <li key={word.id}>
            {word.term} - {word.definition}
            <button onClick={() => handleDelete(word.id)}>삭제</button>
          </li>
        ))}
      </ul>
      {words.length > 0 && (
        <button onClick={() => router.push(`/${params.id}/wordbook/${params.wid}/study`)}>
          학습 시작
        </button>
      )}
    </div>
  )
}