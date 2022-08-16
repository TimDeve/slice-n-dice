import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"
import TimerIcon from "@mui/icons-material/Timer"
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  Typography,
} from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import { useSnackbar } from "notistack"
import { Suspense, lazy, useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"

import { Recipe } from "../domain"
import * as gateway from "../gateway"
import { VoidFn } from "../shared/typeUtils"
import NewRecipeForm from "./NewRecipeForm"

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
        {newRecipeOpen && <NewRecipeForm />}
        <RecipeList />
      </Container>
      <Fab
        className={styles.fab}
        color={"secondary"}
        onClick={() => setNewRecipeOpen(!newRecipeOpen)}
      >
        {newRecipeOpen ? <CloseIcon /> : <AddIcon />}
      </Fab>
    </>
  )
}

interface DeleteRecipeDialogProps {
  recipeName: string
  isOpen: boolean
  handleClose: VoidFn
  handleDelete: VoidFn
}

function DeleteRecipeDialog({
  recipeName,
  isOpen,
  handleClose,
  handleDelete,
}: DeleteRecipeDialogProps) {
  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Deleting Recipe</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete {recipeName}?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={handleClose}>
          Cancel
        </Button>
        <Button color="error" onClick={handleDelete} autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
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
      {data.length === 0 && (
        <Typography
          variant="h5"
          style={{ fontSize: "1.286em", color: "#a7a7a7", marginTop: "16px" }}
        >
          Nothing yet...
        </Typography>
      )}
      {data.map(recipe => (
        <RecipeItem key={recipe.id} {...recipe} />
      ))}
    </>
  )
}

function RecipeItem({ name, quick, id }: Recipe) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const { mutate: deleteRecipe } = useMutation(gateway.deleteRecipe, {
    onSuccess: () => {
      setDeleteDialogOpen(false)
      queryClient.invalidateQueries(gateway.getRecipes.name)
    },
    onError: () => {
      enqueueSnackbar("Failed to delete recipe", { variant: "error" })
    },
  })

  return (
    <>
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
          <Button
            color="error"
            size="small"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </CardActions>
      </Card>
      <DeleteRecipeDialog
        recipeName={name}
        isOpen={deleteDialogOpen}
        handleClose={() => setDeleteDialogOpen(false)}
        handleDelete={() => deleteRecipe(id)}
      />
    </>
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
