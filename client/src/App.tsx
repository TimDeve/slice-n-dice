import React, { useEffect, useRef, useState } from "react"
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "react-query"
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles"
import {
  AppBar,
  Container,
  CssBaseline,
  Card,
  Toolbar,
  Typography,
  CardContent,
  CardActions,
  Button,
  Fab,
  makeStyles,
  TextField,
} from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import CloseIcon from "@material-ui/icons/Close"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import localizedFormat from "dayjs/plugin/localizedFormat"

import * as gateway from "./gateway"
import { Recipe } from "./domain"

dayjs.extend(localizedFormat)
dayjs.extend(duration)

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#DD2E44",
    },
    secondary: {
      main: "#f50057",
    },
  },
})

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Page />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const useStyles = makeStyles(theme => ({
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  recipeItemAlert: () => {
    return { color: theme.palette.text.secondary }
  },
}))

function Page() {
  const styles = useStyles({})
  const [newRecipeOpen, setNewRecipeOpen] = useState(false)

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography component="p" variant="h6">
            Slice n' Dice
          </Typography>
        </Toolbar>
      </AppBar>
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
  const { mutateAsync: createRecipe } = useMutation(gateway.createRecipe, {
    onSuccess: () => {
      queryClient.invalidateQueries(gateway.getRecipes.name)
      onSuccess()
    },
  })
  const [name, setName] = useState("")

  return (
    <Card style={{ marginTop: "14px", marginBottom: "14px" }}>
      <form
        onSubmit={e => {
          e.preventDefault()
          if (name) {
            createRecipe({
              name,
            })
          }
        }}
      >
        <CardContent>
          <TextField
            value={name}
            name="name"
            placeholder="Recipe Name"
            onChange={e => setName(e.target.value)}
          />
        </CardContent>
        <CardActions>
          <Button type="submit" size="small">
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

function RecipeItem({ name, id }: Recipe) {
  const { mutateAsync: deleteRecipe } = useMutation(gateway.deleteRecipe, {
    onSuccess: () => {
      queryClient.invalidateQueries(gateway.getRecipes.name)
    },
  })

  return (
    <Card style={{ marginTop: "14px", marginBottom: "14px" }}>
      <CardContent>
        <Typography variant="h5" component="p">
          {name}
        </Typography>
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

export default App
