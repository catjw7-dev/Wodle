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
  const [mode, setMode] = useState('term')
  const [order, setOrder] = useState('normal')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTerm, setEditTerm] = useState('')
  const [editDefinition, setEditDefinition] = useState('')
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
    if (error) { setError(error.message); return }
    setTerm('')
    setDefinition('')
    setError('')
    fetchWords()
  }

  async function handleDelete(wordId: string) {
    await supabase.from('words').delete().eq('id', wordId)
    fetchWords()
  }

  function handleEditStart(word: Word) {
    setEditingId(word.id)
    setEditTerm(word.term)
    setEditDefinition(word.definition)
  }

  async function handleEditSave() {
    if (!editTerm.trim() || !editDefinition.trim()) return
    await supabase
      .from('words')
      .update({ term: editTerm, definition: editDefinition })
      .eq('id', editingId)
    setEditingId(null)
    fetchWords()
  }

  async function handleStudyStart() {
    await supabase
      .from('wordbooks')
      .update({ last_mode: mode, last_order: order })
      .eq('id', params.wid)
    router.push(`/${params.id}/wordbook/${params.wid}/study?mode=${mode}&order=${order}`)
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
            {editingId === word.id ? (
              <>
                <input value={editTerm} onChange={e => setEditTerm(e.target.value)} />
                <input value={editDefinition} onChange={e => setEditDefinition(e.target.value)} />
                <button onClick={handleEditSave}>저장</button>
                <button onClick={() => setEditingId(null)}>취소</button>
              </>
            ) : (
              <>
                {word.term} - {word.definition}
                <button onClick={() => handleEditStart(word)}>수정</button>
                <button onClick={() => handleDelete(word.id)}>삭제</button>
              </>
            )}
          </li>
        ))}
      </ul>

      <div>
        <p>문제 유형</p>
        <button onClick={() => setMode('term')} style={{ fontWeight: mode === 'term' ? 'bold' : 'normal' }}>단어 적기</button>
        <button onClick={() => setMode('definition')} style={{ fontWeight: mode === 'definition' ? 'bold' : 'normal' }}>뜻 적기</button>
        <button onClick={() => setMode('shuffle')} style={{ fontWeight: mode === 'shuffle' ? 'bold' : 'normal' }}>셔플</button>
      </div>
      <div>
        <p>순서</p>
        <button onClick={() => setOrder('normal')} style={{ fontWeight: order === 'normal' ? 'bold' : 'normal' }}>정방향</button>
        <button onClick={() => setOrder('random')} style={{ fontWeight: order === 'random' ? 'bold' : 'normal' }}>셔플</button>
      </div>

      {words.length === 0 ? (
        <p style={{ color: 'gray' }}>단어를 추가해주세요!</p>
      ) : (
        <button onClick={handleStudyStart}>학습 시작</button>
      )}
    </div>
  )
}