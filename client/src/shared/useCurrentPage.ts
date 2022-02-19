import { useMatch } from "react-router-dom"

export type Pages = "calendar" | "recipes" | "fridge" | null

export default function useCurrentPage(): Pages {
  const isRootPage = useMatch({ path: "/" })!!
  const isCalendarPage =
    useMatch({ path: "/calendar/:weekStart" })!! || isRootPage
  const isRecipesPage = useMatch({ path: "/recipes" })!!
  const isFridgePage = useMatch({ path: "/fridge" })!!

  if (isCalendarPage) {
    return "calendar"
  } else if (isRecipesPage) {
    return "recipes"
  } else if (isFridgePage) {
    return "fridge"
  }

  return null
}
