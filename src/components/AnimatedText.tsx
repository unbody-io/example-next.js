import React, { useEffect, useMemo, useRef, useState } from 'react'

export type AnimatedTextProps = {
  text: string
  cps?: number
  cpc?: number
  maxTime?: number
  disabled?: boolean
}

export const useAnimatedText = (
  text: string,
  opts?: {
    cps?: number
    cpc?: number
    maxTime?: number
    disabled?: boolean
  }
) => {
  const ref = useRef<string>(text)
  const {
    cpc = 1,
    cps = 30,
    maxTime = undefined,
    disabled = false,
  } = opts || {}
  const [animatedText, setAnimatedText] = useState('')

  const speed = useMemo(() => {
    if (typeof maxTime !== 'number' || isNaN(maxTime)) {
      return [cps, cpc]
    }

    const textLength = text.length

    const maxCps = 30
    const maxCalls = (maxTime / 1000) * maxCps
    const totalChars = maxCalls * cpc

    if (textLength > totalChars) {
      const requiredCalls = maxTime / 1000
      let newCps = Math.ceil(textLength / (cpc * requiredCalls))
      let newCpc = Math.ceil(textLength / (maxCps * requiredCalls))

      if (newCps > maxCps) {
        newCps = maxCps
        newCpc = Math.ceil(textLength / (newCps * requiredCalls))
      }

      return [newCps, newCpc]
    }

    return [cps, cpc]
  }, [text, cps, cpc, maxTime])

  useEffect(() => {
    if (disabled) {
      setAnimatedText(text)
      return
    }

    let _text = animatedText

    if (ref.current !== text) {
      if (text.startsWith(ref.current)) {
        _text = ref.current
      } else {
        _text = text.slice(0, 1)
      }

      ref.current = text
      setAnimatedText(ref.current)
    }

    const interval = setInterval(() => {
      if (_text.length === text.length) {
        clearInterval(interval)
        return
      } else {
        _text += text.slice(_text.length, _text.length + speed[1])
        setAnimatedText(_text)
      }
    }, 1000 / speed[0])

    return () => clearInterval(interval)
  }, [text, speed, disabled])

  return animatedText
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text: nextText,
  cps = 30,
  cpc = 1,
  disabled,
  maxTime,
}) => {
  const text = useAnimatedText(nextText, {
    cpc,
    cps,
    maxTime,
    disabled,
  })
  return <>{text}</>
}
