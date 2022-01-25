import { useEffect, useRef } from "react"

export default function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    let id = setInterval(() => {
      savedCallback.current?.()
    }, delay)
    return () => clearInterval(id)
  }, [delay])
}
