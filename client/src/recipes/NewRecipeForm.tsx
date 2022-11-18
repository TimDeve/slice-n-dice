import { Card } from "@mui/material"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSnackbar } from "notistack"
import { useState } from "react"

import * as gateway from "../gateway"
import { VoidFn } from "../shared/typeUtils"
import RecipeForm from "./RecipeForm"

function useEditorKey(): [key: number, reset: VoidFn] {
  const [key, setKey] = useState(0)

  return [key, () => setKey(k => k + 1)]
}

interface NewRecipeFormProps {
  onSuccess?: VoidFn
}
export default function NewRecipeForm({ onSuccess }: NewRecipeFormProps) {
  const { enqueueSnackbar } = useSnackbar()
  const nameState = useState("")
  const quickState = useState<boolean>(false)
  const bodyState = useState("")
  const [bodyKey, resetBodyKey] = useEditorKey()
  const queryClient = useQueryClient()

  const { mutate: createRecipe } = useMutation(gateway.createRecipe, {
    onSuccess: () => {
      queryClient.invalidateQueries([gateway.getRecipes.name])
      nameState[1]("")
      resetBodyKey()
      onSuccess?.()
    },
    onError: () => {
      enqueueSnackbar("Failed to create recipe", { variant: "error" })
    },
  })

  function onSubmit() {
    createRecipe({
      name: nameState[0],
      quick: quickState[0],
      body: bodyState[0],
    })
  }

  return (
    <Card sx={{ marginTop: "14px", marginBottom: "14px" }}>
      <RecipeForm
        {...{ nameState, quickState, bodyState, bodyKey, onSubmit }}
      />
    </Card>
  )
}
