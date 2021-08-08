import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import {
  Container,
  Card,
  Typography,
  CardContent,
  CardActions,
  Checkbox,
  FormControlLabel,
  Button,
  Fab,
  makeStyles,
  TextField,
} from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import CloseIcon from "@material-ui/icons/Close"
import TimerIcon from "@material-ui/icons/Timer"
import { useSnackbar } from "notistack"

import * as gateway from "./gateway"
import { Recipe } from "./domain"

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

export default function Recipes() {
  const styles = useStyles({})
  const [newRecipeOpen, setNewRecipeOpen] = useState(false)

  return (
    <>
      <Container maxWidth="sm">
        {newRecipeOpen && (
          <NewRecipeForm onSuccess={() => setNewRecipeOpen(false)} />
        )}
        <RecipeList />
      </Container>
      <Fab
        className={styles.fab}
        color="primary"
        onClick={() => setNewRecipeOpen(!newRecipeOpen)}
      >
        {newRecipeOpen ? <CloseIcon /> : <AddIcon />}
      </Fab>
    </>
  )
}

interface NewRecipeFormProps {
  onSuccess: () => void
}
function NewRecipeForm({ onSuccess }: NewRecipeFormProps) {
  const styles = useStyles({})
  const { enqueueSnackbar } = useSnackbar()
  const [name, setName] = useState("")
  const [quick, setQuick] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const { mutate: createRecipe } = useMutation(gateway.createRecipe, {
    onSuccess: () => {
      queryClient.invalidateQueries(gateway.getRecipes.name)
      setName("")
    },
    onError: () => {
      enqueueSnackbar("Failed to create recipe", { variant: "error" })
    },
  })

  function submitable(): boolean {
    return !!name
  }

  return (
    <Card style={{ marginTop: "14px", marginBottom: "14px" }}>
      <form
        onSubmit={e => {
          e.preventDefault()
          createRecipe({
            name,
            quick,
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

function RecipeList() {
  const { isLoading, error, data } = useQuery(
    gateway.getRecipes.name,
    gateway.getRecipes
  )

  if (isLoading) {
    return <Loading />
  }

  if (error || !data) {
    return <>"Oops, something went wrong!"</>
  }

  return (
    <>
      {data.map(recipe => (
        <RecipeItem key={recipe.id} {...recipe} />
      ))}
    </>
  )
}

function RecipeItem({ name, quick, id }: Recipe) {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const { mutate: deleteRecipe } = useMutation(gateway.deleteRecipe, {
    onSuccess: () => {
      queryClient.invalidateQueries(gateway.getRecipes.name)
    },
    onError: () => {
      enqueueSnackbar("Failed to delete recipe", { variant: "error" })
    },
  })

  return (
    <Card style={{ marginTop: "14px", marginBottom: "14px" }}>
      <CardContent>
        <Typography
          variant="h5"
          component="div"
          style={{ fontSize: "1.286em" }}
        >
          {name}
        </Typography>
        {quick && (
          <>
            <TimerIcon
              style={{
                width: "16px",
                marginRight: "3px",
                marginLeft: "-3px",
                verticalAlign: "bottom",
                marginBottom: "-2px",
              }}
            />
            <Typography variant="caption">Under 30 minutes</Typography>
          </>
        )}
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => deleteRecipe(id)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  )
}

function Loading() {
  const timeoutRef = useRef<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true)
    }, 500)

    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current)
    }
  }, [])

  return <>{isVisible && "Loading..."}</>
}
