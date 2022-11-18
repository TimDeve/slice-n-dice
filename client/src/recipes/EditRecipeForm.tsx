import { Card } from "@mui/material"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSnackbar } from "notistack"
import { useState } from "react"
import { Recipe } from "../domain"

import * as gateway from "../gateway"
import { VoidFn } from "../shared/typeUtils"
import RecipeForm from "./RecipeForm"

function useEditorKey(): [key: number, reset: VoidFn] {
  const [key, setKey] = useState(0)

  return [key, () => setKey(k => k + 1)]
}

interface EditRecipeFormProps {
  onSuccess?: VoidFn
  recipe: Recipe
}
export default function EditRecipeForm({ onSuccess, recipe }: EditRecipeFormProps) {
  const { enqueueSnackbar } = useSnackbar()
  const nameState = useState(recipe.name)
  const quickState = useState<boolean>(recipe.quick)
  const bodyState = useState(recipe.body)
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
      <RecipeForm
        {...{ nameState, quickState, bodyState, bodyKey, onSubmit }}
      />
  )
}
