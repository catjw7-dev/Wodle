import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { term } = await req.json()
  
  console.log('받은 단어:', term)

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a Korean dictionary assistant. When given an English word, respond with only the most common Korean translation. No explanations, no extra words, just the Korean meaning. Example: apple -> 사과'
        },
        {
          role: 'user',
          content: term
        }
      ],
      max_tokens: 50
    })
  })

  const data = await response.json()
  console.log('Groq 응답:', JSON.stringify(data))
  
  const definition = data.choices?.[0]?.message?.content?.trim() ?? ''

  return NextResponse.json({ definition })
}