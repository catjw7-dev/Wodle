'use client'

import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Word = {
  id: string
  term: string
  definition: string
  wrong_count: number
  showTerm?: boolean
}

export default function ReviewPage() {
  const [words, setWords] = useState<Word[]>([])
  const [current, setCurrent] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [finished, setFinished] = useState(false)
  const [wrongCount, setWrongCount] = useState(0)
  const [mode, setMode] = useState('term')
  const [correctCount, setCorrectCount] = useState(0)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchWords()
  }, [])

  async function fetchWords() {
    const { data: wordbook } = await supabase
      .from('wordbooks')
      .select('last_mode')
      .eq('id', params.wid)
      .single()

    const savedMode = wordbook?.last_mode ?? 'term'
    setMode(savedMode)

    const { data } = await supabase
      .from('words')
      .select('*')
      .eq('wordbook_id', params.wid)
      .gt('wrong_count', 0)

    if (!data) return

    let list = [...data]
    if (savedMode === 'shuffle') list = list.map(w => ({ ...w, showTerm: Math.random() > 0.5 }))
    setWords(list)
  }

  function getQuestion(word: Word) {
    if (mode === 'term') return word.definition
    if (mode === 'definition') return word.term
    return word.showTerm ? word.term : word.definition
  }

  function getAnswer(word: Word) {
    if (mode === 'term') return word.term
    if (mode === 'definition') return word.definition
    return word.showTerm ? word.definition : word.term
  }

  async function handleCheck() {
    const correct = getAnswer(words[current])
    if (answer.trim() === correct.trim()) {
      setResult('correct')
      setCorrectCount(prev => prev + 1)
      await supabase
        .from('words')
        .update({ wrong_count: Math.max(0, words[current].wrong_count - 1) })
        .eq('id', words[current].id)
    } else {
      setResult('wrong')
      setWrongCount(prev => prev + 1)
      await supabase
        .from('words')
        .update({ wrong_count: words[current].wrong_count + 1 })
        .eq('id', words[current].id)
    }
  }

  function handleNext() {
    setAnswer('')
    setResult(null)
    if (current + 1 >= words.length) {
      setFinished(true)
    } else {
      setCurrent(prev => prev + 1)
    }
  }

  const progress = words.length > 0 ? Math.round((correctCount / words.length) * 100) : 0

  if (words.length === 0) return <p>복습할 단어가 없어요!</p>

  if (finished) {
    return (
      <div>
        <h1>복습 완료!</h1>
        <p>틀린 단어: {wrongCount}개</p>
        <button onClick={() => router.push(`/${params.id}/home`)}>
          홈으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div>
      <p>복습 모드</p>
      <p>Progress: {progress}%</p>
      <p>{current + 1} / {words.length}</p>
      <h2>{getQuestion(words[current])}</h2>
      <input
        placeholder="답 입력"
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !result && handleCheck()}
        disabled={!!result}
      />
      {!result && <button onClick={handleCheck}>확인</button>}
      {result === 'correct' && <p>정답!</p>}
      {result === 'wrong' && <p>오답! 정답: {getAnswer(words[current])}</p>}
      {result && <button onClick={handleNext}>다음</button>}
    </div>
  )
}