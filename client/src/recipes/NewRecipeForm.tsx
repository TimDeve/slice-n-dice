import {
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import type { RawDraftContentState } from "draft-js"
import { useSnackbar } from "notistack"
import { FormEvent, Suspense, lazy, useState } from "react"
import { useMutation, useQueryClient } from "react-query"

import * as gateway from "../gateway"
import LoadingText from "../shared/LoadingText"
import { VoidFn } from "../shared/typeUtils"

const LazyNewRecipeBodyField = lazy(() => import("./NewRecipeBodyField"))

const useStyles = makeStyles(theme => ({
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  recipeItemAlert: () => {
    return { color: theme.palette.text.secondary }
  },
  field: {
    marginBottom: theme.spacing(1),
  },
}))

function genEmptyRawEditorState(): RawDraftContentState {
  return {
    blocks: [],
    entityMap: {},
  }
}

function useEditorKey(): [number, VoidFn] {
  const [key, setKey] = useState(0)

  return [key, () => setKey(k => k + 1)]
}

interface NewRecipeFormProps {
  onSuccess?: VoidFn
}
export default function NewRecipeForm({ onSuccess }: NewRecipeFormProps) {
  const styles = useStyles({})
  const { enqueueSnackbar } = useSnackbar()
  const [name, setName] = useState("")
  const [quick, setQuick] = useState<boolean>(false)
  const [body, setBody] = useState(genEmptyRawEditorState())
  const [bodyKey, resetBodyKey] = useEditorKey()

  const queryClient = useQueryClient()
  const { mutate: createRecipe } = useMutation(gateway.createRecipe, {
    onSuccess: () => {
      queryClient.invalidateQueries(gateway.getRecipes.name)
      setName("")
      resetBodyKey()
      onSuccess?.()
    },
    onError: () => {
      enqueueSnackbar("Failed to create recipe", { variant: "error" })
    },
  })

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    createRecipe({
      name,
      quick,
      body,
    })
  }

  function submitable(): boolean {
    return !!name
  }

  return (
    <Card sx={{ marginTop: "14px", marginBottom: "14px" }}>
      <form onSubmit={onSubmit}>
        <CardContent>
          <TextField
            className={styles.field}
            value={name}
            name="name"
            label="Recipe Name"
            onChange={e => setName(e.target.value)}
          />
          <br />
          <FormControlLabel
            control={
              <Checkbox
                checked={quick}
                name="quick"
                onChange={e => setQuick(e.target.checked)}
              />
            }
            label="Under 30 minutes?"
          />
          <Suspense fallback={<LoadingText zeroHeight block />}>
            <LazyNewRecipeBodyField
              onChange={state => setBody(state)}
              key={bodyKey}
            />
          </Suspense>
        </CardContent>
        <CardActions>
          <Button type="submit" size="small" disabled={!submitable()}>
            Add
          </Button>
        </CardActions>
      </form>
    </Card>
  )
}
