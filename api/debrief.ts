export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `You are the SMELTR coach — a direct, honest, personal accountability coach built for young men who are serious about self-improvement. You are not a therapist, not a cheerleader, and not generic. You are a coach who has read the user's data and speaks plainly.

Your coaching style:
- Direct and honest — say what needs to be said, not what feels good
- Personal — reference their actual habit data, not generic advice
- Brief — no more than 4-5 sentences per response unless asked for more
- Actionable — always end with one concrete thing to do or think about
- Never preachy — one point made well beats five points made weakly

You receive the user's habit completion data, their reflection, and their recent history. Use all of it.`

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // @ts-ignore
  const apiKey = process.env.ANTHROPIC_API_KEY

  // Mock mode — no API key or placeholder
  if (!apiKey || apiKey === 'placeholder') {
    const { score, reflection } = await req.json()
    const mockResponse = generateMockResponse(score, reflection)
    return new Response(JSON.stringify({ response: mockResponse }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()
    const { score, reflection, habitData, history } = body

    const userMessage = buildUserMessage(score, reflection, habitData, history)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: err }), { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || 'No response.'

    return new Response(JSON.stringify({ response: text }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}

function buildUserMessage(
  score: number,
  reflection: string,
  habitData: Record<string, boolean>,
  history: Array<{ date: string; score: number }>
) {
  const completedHabits = Object.entries(habitData)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(', ')

  const missedHabits = Object.entries(habitData)
    .filter(([, v]) => !v)
    .map(([k]) => k)
    .join(', ')

  const historyStr = history.length
    ? history.map(h => `${h.date}: ${h.score}%`).join(', ')
    : 'No history yet'

  return `
Today's habit score: ${score}%
Completed: ${completedHabits || 'none'}
Missed: ${missedHabits || 'none'}
Recent scores: ${historyStr}

User's reflection:
"${reflection || 'No reflection written.'}"

Give me your honest debrief.
`.trim()
}

function generateMockResponse(score: number, reflection: string): string {
  if (score === 100) {
    return "Perfect score today. Every single habit done. That's not luck — that's a decision made over and over again throughout the day. The question now is whether you can string two of these together. One perfect day is a good day. Two in a row is the start of a standard."
  }
  if (score >= 70) {
    return `${score}% today — above threshold, which means you're building. But I want to know about the ones you missed. Those aren't accidents. Something is either unclear, inconvenient, or you're avoiding it. Pick the one habit you keep skipping and ask yourself why it specifically keeps losing. That's where the real work is.`
  }
  if (score >= 40) {
    return `${score}% — you showed up but you didn't finish. There's a gap between starting the day with intention and actually following through. ${reflection ? "Your reflection shows you're aware of it, which matters." : "You didn't write a reflection today, which tells me you already know why."} Tomorrow pick three non-negotiable habits — just three — and treat those like they cannot be skipped no matter what happens.`
  }
  return `${score}% today. I'm not going to pretend that's acceptable and neither should you. Something got in the way — stress, distraction, a bad start — but none of those are reasons, they're excuses. The habits exist precisely for hard days. Tomorrow starts tonight. Lay out exactly what the first 30 minutes of your morning looks like and follow it before you check your phone.`
}