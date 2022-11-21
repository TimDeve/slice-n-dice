import { ElementType, Suspense, lazy } from "react"

async function fetchQueryDevtools() {
  const { ReactQueryDevtools } = await import("@tanstack/react-query-devtools")
  return { default: ReactQueryDevtools }
}

const AsyncQueryDevTools = lazy(fetchQueryDevtools)

export default function QueryDevtools() {
  if (process.env.NODE_ENV === "development") {
    return (
      <Suspense fallback={<></>}>
        <AsyncQueryDevTools initialIsOpen={false} />
      </Suspense>
    )
  } else {
    return <></>
  }
}
