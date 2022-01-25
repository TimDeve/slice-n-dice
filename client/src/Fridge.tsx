import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"
import DatePicker from "@mui/lab/DatePicker/DatePicker"
import Button from "@mui/material/Button/Button"
import Card from "@mui/material/Card/Card"
import CardActions from "@mui/material/CardActions/CardActions"
import CardContent from "@mui/material/CardContent/CardContent"
import Container from "@mui/material/Container/Container"
import Fab from "@mui/material/Fab/Fab"
import TextField from "@mui/material/TextField/TextField"
import Typography from "@mui/material/Typography/Typography"
import makeStyles from "@mui/styles/makeStyles"
import dayjs, { Dayjs } from "dayjs"
import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"

import { Food } from "./domain"
import * as gateway from "./gateway"

const useStyles = makeStyles(theme => ({
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  foodItemAlert: ({ date }: { date?: Dayjs } = {}) => {
    if (!date) {
      return { color: theme.palette.text.secondary }
    }

    const daysBeforeBBD = dayjs.duration(dayjs().diff(date)).days()

    if (daysBeforeBBD <= -1) {
      return { color: theme.palette.text.secondary }
    } else if (daysBeforeBBD <= 0) {
      return { color: theme.palette.warning.main }
    } else {
      return { color: theme.palette.error.main }
    }
  },
  field: {
    display: "block",
    marginBottom: theme.spacing(2),
  },
}))

function NewFoodForm() {
  const styles = useStyles()
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [date, setDate] = useState<Dayjs | null>(dayjs())
  const { mutateAsync: createFood } = useMutation(gateway.createFood, {
    onSuccess: () => {
      queryClient.invalidateQueries(gateway.getFoods.name)
      setName("")
      setDate(dayjs())
    },
  })

  return (
    <Card style={{ marginTop: "14px", marginBottom: "14px" }}>
      <form
        onSubmit={e => {
          e.preventDefault()
          if (name && date) {
            createFood({
              name,
              bestBeforeDate: date,
            })
          }
        }}
      >
        <CardContent>
          <TextField
            value={name}
            label="Food Name"
            name="name"
            onChange={e => setName(e.target.value)}
            className={styles.field}
          />
          <DatePicker
            value={date}
            label="Date"
            onChange={newDate => {
              setDate(newDate as Dayjs)
            }}
            className={styles.field}
            renderInput={props => <TextField {...props} />}
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

function FoodList() {
  const { isLoading, error, data } = useQuery(
    gateway.getFoods.name,
    gateway.getFoods
  )

  if (isLoading) {
    return <Loading />
  }

  if (error || !data) {
    return <>"Oops, something went wrong!"</>
  }

  return (
    <>
      {data.length == 0 && (
        <Typography
          variant="h5"
          style={{ fontSize: "1.286em", color: "#a7a7a7", marginTop: "16px" }}
        >
          Nothing yet...
        </Typography>
      )}
      {data.map(food => (
        <FoodItem key={food.id} {...food} />
      ))}
    </>
  )
}

function FoodItem({ name, bestBeforeDate, id }: Food) {
  const queryClient = useQueryClient()
  const styles = useStyles({ date: bestBeforeDate })
  const { mutateAsync: deleteFood } = useMutation(gateway.deleteFood, {
    onSuccess: () => {
      queryClient.invalidateQueries(gateway.getFoods.name)
    },
  })

  return (
    <Card style={{ marginTop: "14px", marginBottom: "14px" }}>
      <CardContent>
        <Typography className={styles.foodItemAlert} gutterBottom>
          Best Before: {bestBeforeDate.format("ll")}
        </Typography>
        <Typography
          variant="h5"
          component="div"
          style={{ fontSize: "1.286em" }}
        >
          {name}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => deleteFood(id)}>
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

export default function Fridge() {
  const styles = useStyles({})
  const [newFoodOpen, setNewFoodOpen] = useState(false)

  return (
    <>
      <Container maxWidth="sm">
        {newFoodOpen && <NewFoodForm />}
        <FoodList />
      </Container>
      <Fab
        className={styles.fab}
        color="primary"
        onClick={() => setNewFoodOpen(!newFoodOpen)}
      >
        {newFoodOpen ? <CloseIcon /> : <AddIcon />}
      </Fab>
    </>
  )
}
