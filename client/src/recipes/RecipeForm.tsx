import {
  Button,
  CardActions,
  CardContent,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import { FormEvent, Suspense, lazy } from "react"

import LoadingText from "../shared/LoadingText"
import htmlToRawState from "../shared/text-editor/htmlToRawState"
import { VoidFn } from "../shared/typeUtils"

const LazyRecipeBodyField = lazy(() => import("./RecipeBodyField"))

const useStyles = makeStyles(theme => ({
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  recipeItemAlert: () => ({ color: theme.palette.text.secondary }),
  field: {
    marginBottom: theme.spacing(1),
  },
}))

type ReactState<T> = [
  state: T,
  setState: React.Dispatch<React.SetStateAction<T>>
]

interface RecipeFormProps {
  onSubmit: VoidFn
  nameState: ReactState<string>
  quickState: ReactState<boolean>
  bodyState: ReactState<string>
  bodyKey: number
  defaultBody?: string
}
export default function RecipeForm(p: RecipeFormProps) {
  const styles = useStyles({})
  const [name, setName] = p.nameState
  const [quick, setQuick] = p.quickState
  const setBody = p.bodyState[1]

  function submitable(): boolean {
    return !!name
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    p.onSubmit()
  }

  return (
    <form
      style={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        maxHeight: "95%",
      }}
      onSubmit={onSubmit}
    >
      <CardContent
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100% - 64px)",
        }}
      >
        <TextField
          className={styles.field}
          value={name}
          name="name"
          label="Recipe Name"
          onChange={e => setName(e.target.value)}
        />
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
          <LazyRecipeBodyField
            onChange={state => setBody(state)}
            fieldKey={p.bodyKey}
            defaultValue={
              p.defaultBody ? htmlToRawState(p.defaultBody) : undefined
            }
          />
        </Suspense>
      </CardContent>
      <CardActions>
        <Button type="submit" size="small" disabled={!submitable()}>
          Save
        </Button>
      </CardActions>
    </form>
  )
}
