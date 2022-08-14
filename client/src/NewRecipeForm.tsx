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
import {
  DraftHandleValue,
  EditorState,
  SelectionState,
  convertToRaw,
} from "draft-js"
import MUIRichTextEditor from "mui-rte"
import { useSnackbar } from "notistack"
import { useState } from "react"
import { useMutation, useQueryClient } from "react-query"

import * as gateway from "./gateway"
import { VoidFn } from "./shared/typeUtils"

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

function useEditorKey(): [number, VoidFn] {
  const [key, setKey] = useState(0)

  return [key, () => setKey(k => k + 1)]
}

interface NewRecipeFormProps {
  onSuccess: VoidFn
}
export default function NewRecipeForm({ onSuccess }: NewRecipeFormProps) {
  const styles = useStyles({})
  const { enqueueSnackbar } = useSnackbar()
  const [name, setName] = useState("")
  const [quick, setQuick] = useState<boolean>(false)
  const [body, setBody] = useState(EditorState.createEmpty())
  const [bodyKey, resetBodyKey] = useEditorKey()

  const queryClient = useQueryClient()
  const { mutate: createRecipe } = useMutation(gateway.createRecipe, {
    onSuccess: () => {
      queryClient.invalidateQueries(gateway.getRecipes.name)
      setName("")
      resetBodyKey()
    },
    onError: () => {
      enqueueSnackbar("Failed to create recipe", { variant: "error" })
    },
  })

  function submitable(): boolean {
    return !!name
  }

  return (
    <Card sx={{ marginTop: "14px", marginBottom: "14px" }}>
      <form
        onSubmit={e => {
          e.preventDefault()
          createRecipe({
            name,
            quick,
            body: convertToRaw(body.getCurrentContent()),
          })
        }}
      >
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
          <Card sx={{ minHeight: "160px" }} variant="outlined">
            <MUIRichTextEditor
              label="Recipe instructions..."
              key={bodyKey}
              controls={[
                "title",
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "link",
                "numberList",
                "bulletList",
              ]}
              onChange={state => setBody(state)}
              inlineToolbar={true}
            />
          </Card>
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
