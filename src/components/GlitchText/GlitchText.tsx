import { useEffect, useRef, useState } from 'react'
import styles from './GlitchText.module.css'

interface Props {
  text: string
  className?: string
  intensity?: 'low' | 'medium' | 'high'
  as?: keyof JSX.IntrinsicElements
}

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#@$%&'

const GlitchText = ({ text, className = '', intensity = 'medium', as: Tag = 'span' }: Props) => {
  const [display, setDisplay] = useState(text)
  const [isGlitching, setIsGlitching] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const triggerGlitch = () => {
    if (isGlitching) return
    setIsGlitching(true)
    let iterations = 0
    const speed = intensity === 'high' ? 40 : intensity === 'medium' ? 55 : 70

    frameRef.current = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ' || char === '\n') return char
            if (i < iterations) return text[i]
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
          })
          .join('')
      )
      iterations += 1
      if (iterations > text.length + 2) {
        if (frameRef.current) clearInterval(frameRef.current)
        setDisplay(text)
        setIsGlitching(false)
      }
    }, speed)
  }

  useEffect(() => {
    const delays: Record<string, number> = { low: 6000, medium: 4000, high: 2500 }
    const jitter = Math.random() * 2000
    intervalRef.current = setInterval(triggerGlitch, delays[intensity] + jitter)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (frameRef.current) clearInterval(frameRef.current)
    }
  }, [])

  return (
    <Tag
      className={`${styles.glitch} ${styles[intensity]} ${className}`}
      data-text={text}
      onMouseEnter={triggerGlitch}
    >
      {display}
    </Tag>
  )
}

export default GlitchText
