// app/[id]/wordbook/[wid]/study/page.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { updateStreak } from '@/utils/streak'
import { awardCoins } from '@/utils/coin'
import { checkAnswer } from '@/utils/checkAnswer'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Word = {
  id: string
  term: string
  definition: string
  wrong_count: number
  showTerm?: boolean
}

export default function StudyPage() {
  const [words, setWords] = useState<Word[]>([])
  const [wrongWords, setWrongWords] = useState<Word[]>([])
  const [current, setCurrent] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [finished, setFinished] = useState(false)
  const [isReview, setIsReview] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [coinResult, setCoinResult] = useState<{ earned: number; bonus: number } | null>(null)
  const correctRef = useRef(0)
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') ?? 'term'
  const order = searchParams.get('order') ?? 'normal'
  const supabase = createClient()

  useEffect(() => {
    fetchWords()
  }, [])

  async function fetchWords() {
    const { data } = await supabase
      .from('words')
      .select('*')
      .eq('wordbook_id', params.wid)

    if (!data) return

    let list = [...data]
    if (order === 'random') list = list.sort(() => Math.random() - 0.5)
    if (mode === 'shuffle') list = list.map(w => ({ ...w, showTerm: Math.random() > 0.5 }))
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
    const currentWords = isReview ? wrongWords : words
    const correct = getAnswer(currentWords[current])
    if (checkAnswer(answer, correct)) {
      setResult('correct')
      correctRef.current += 1
      setCorrectCount(correctRef.current)
      if (!isReview) {
        await supabase
          .from('words')
          .update({ wrong_count: Math.max(0, currentWords[current].wrong_count - 1) })
          .eq('id', currentWords[current].id)
      }
    } else {
      setResult('wrong')
      if (!isReview) {
        setWrongWords(prev => [...prev, currentWords[current]])
        await supabase
          .from('words')
          .update({ wrong_count: currentWords[current].wrong_count + 1 })
          .eq('id', currentWords[current].id)
      }
    }
  }

  async function handleNext() {
    const currentWords = isReview ? wrongWords : words
    setAnswer('')
    setResult(null)
    if (current + 1 >= currentWords.length) {
      await updateStreak()
      if (!isReview) {
        const coins = await awardCoins(correctRef.current)
        setCoinResult(coins)
      }
      setFinished(true)
    } else {
      setCurrent(prev => prev + 1)
    }
  }

  function startReview() {
    setCurrent(0)
    setAnswer('')
    setResult(null)
    setFinished(false)
    setIsReview(true)
    setCorrectCount(0)
    correctRef.current = 0
    setCoinResult(null)
  }

  const currentWords = isReview ? wrongWords : words
  const progress = currentWords.length > 0 ? Math.round((correctCount / currentWords.length) * 100) : 0

  if (currentWords.length === 0) return <p>로딩 중...</p>

  if (finished) {
    return (
      <div>
        <h1>완료!</h1>
        {coinResult && (
          <div>
            <p>🪙 +{coinResult.earned} 코인</p>
            {coinResult.bonus > 0 && <p>🎁 보너스 +{coinResult.bonus} 코인!</p>}
          </div>
        )}
        {!isReview && wrongWords.length > 0 && (
          <button onClick={startReview}>틀린문제 다시 풀기</button>
        )}
        {(isReview || wrongWords.length === 0) && (
          <button onClick={() => router.push(`/${params.id}/wordbook/${params.wid}`)}>
            단어장으로 돌아가기
          </button>
        )}
        <button onClick={() => router.push(`/${params.id}/home`)}>
          홈으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div>
      <p>{isReview ? '틀린문제 다시 풀기' : '단어장 모드'}</p>
      <p>Progress: {progress}%</p>
      <p>{current + 1} / {currentWords.length}</p>
      <h2>{getQuestion(currentWords[current])}</h2>
      <input
        placeholder="답 입력"
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !result && handleCheck()}
        disabled={!!result}
      />
      {!result && <button onClick={handleCheck}>확인</button>}
      {result === 'correct' && <p>정답!</p>}
      {result === 'wrong' && <p>오답! 정답: {getAnswer(currentWords[current])}</p>}
      {result && <button onClick={handleNext}>다음</button>}
    </div>
  )
}