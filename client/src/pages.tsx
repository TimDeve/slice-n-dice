import { ElementType, Suspense, lazy } from "react"

import LoginPage from "./Login"
import ErrorBoundary from "./shared/ErrorBoundary"
import LoadingText from "./shared/LoadingText"

function suspenseWrap(El: ElementType) {
  return () => (
    <ErrorBoundary
      fallback={<p>Hmm, something went wrong loading this page...</p>}
    >
      <Suspense fallback={<LoadingText />}>
        <El />
      </Suspense>
    </ErrorBoundary>
  )
}

export const Calendar = suspenseWrap(lazy(() => import("./Calendar")))
export const Recipes = suspenseWrap(lazy(() => import("./recipes/Recipes")))
export const Fridge = suspenseWrap(lazy(() => import("./Fridge")))
export const Login = LoginPage
