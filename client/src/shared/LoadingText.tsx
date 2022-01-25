import { useState } from "react"

import useInterval from "./useInterval"

export default function LoadingText() {
  const nonBreakingSpace = "\u00a0"
  const [hidden, setHidden] = useState(true)
  const [ellipsis, setEllipsis] = useState("...")

  useInterval(() => {
    if (hidden) {
      setHidden(false)
    } else {
      setEllipsis(elli => {
        switch (elli) {
          case ".":
            return ".."
          case "..":
            return "..."
          case "...":
            return ""
          default:
            return "."
        }
      })
    }
  }, 500)

  return <>{hidden ? nonBreakingSpace : `Loading${ellipsis}`}</>
}
