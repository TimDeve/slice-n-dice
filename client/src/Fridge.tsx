import AddIcon from "@material-ui/icons/Add"
import Button from "@material-ui/core/Button/Button"
import Card from "@material-ui/core/Card/Card"
import CardActions from "@material-ui/core/CardActions/CardActions"
import CardContent from "@material-ui/core/CardContent/CardContent"
import CloseIcon from "@material-ui/icons/Close"
import Container from "@material-ui/core/Container/Container"
import Fab from "@material-ui/core/Fab/Fab"
import TextField from "@material-ui/core/TextField/TextField"
import Typography from "@material-ui/core/Typography/Typography"
import { DatePicker } from "@material-ui/pickers/DatePicker/DatePicker"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { makeStyles } from "@material-ui/core"
import { useEffect, useRef, useState } from "react"

import * as gateway from "./gateway"
import dayjs, { Dayjs } from "./dayjs"
import { Food } from "./domain"

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
    marginBottom: theme.spacing(2) 
  }
}))

interface NewFoodFormProps {
  onSuccess: () => void
}
function NewFoodForm({ onSuccess }: NewFoodFormProps) {
  const styles = useStyles()
  const queryClient = useQueryClient()
  const { mutateAsync: createFood } = useMutation(gateway.createFood, {
    onSuccess: () => {
      queryClient.invalidateQueries(gateway.getFoods.name)
      onSuccess()
    },
  })
  const [name, setName] = useState("")
  const [date, setDate] = useState<Dayjs | null>(dayjs())

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
            name="name"
            placeholder="Food Name"
            onChange={e => setName(e.target.value)}
            className={styles.field}
          />
          <DatePicker
            name="date"
            value={date}
            onChange={newDate => {
              setDate(newDate)
            }}
            className={styles.field}
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
        <Typography variant="h5" component="p">
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
        {newFoodOpen && <NewFoodForm onSuccess={() => setNewFoodOpen(false)} />}
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
