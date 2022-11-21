import { Dialog as MuiDialog, styled } from "@mui/material"
import { Suspense, lazy } from "react"

import LoadingText from "../shared/LoadingText"
import { VoidFn } from "../shared/typeUtils"

const Dialog = styled(MuiDialog)(({ theme }) => ({
  "& .MuiDialog-container": {
    maxWidth: `590px`,
    marginLeft: "auto",
    marginRight: "auto",
  },
  "&>*>.MuiPaper-root": {
    minHeight: "90vh",
    minWidth: "60vw",
    margin: theme.spacing(1),
    height: "100%",
    width: "100%",
  },
}))

export function ViewRecipeDialog(p: {
  isOpen: boolean
  onClose: VoidFn
  recipeId: string
}) {
  const ViewRecipe = lazy(() => import("./ViewRecipe"))

  return (
    <Dialog open={p.isOpen}>
      <Suspense fallback={<LoadingText />}>
        <ViewRecipe onClose={p.onClose} recipeId={p.recipeId} />
      </Suspense>
    </Dialog>
  )
}
