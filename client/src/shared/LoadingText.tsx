import { ReactNode, useState } from "react"

import useInterval from "./useInterval"

interface WrappingElementProps {
  block?: boolean
  children: ReactNode
}
function WrappingElement({ block, children }: WrappingElementProps) {
  if (block) {
    return <div>{children}</div>
  } else {
    return <>{children}</>
  }
}

interface LoadingTextProps {
  zeroHeight?: boolean
  block?: boolean
}
export default function LoadingText(props: LoadingTextProps) {
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

  const whenHidden = props.zeroHeight ? null : nonBreakingSpace

  return (
    <WrappingElement block={props.block}>
      {hidden ? whenHidden : `Loading${ellipsis}`}
    </WrappingElement>
  )
}
