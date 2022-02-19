import BeachAccessIcon from "@mui/icons-material/BeachAccess"
import CasinoIcon from "@mui/icons-material/Casino"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import dayjs, { Dayjs } from "dayjs"
import { useSnackbar } from "notistack"
import React from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useParams } from "react-router-dom"

import * as domain from "./domain"
import * as gateway from "./gateway"
import ButtonLink from "./shared/ButtonLink"
import LoadingText from "./shared/LoadingText"

function ActionBar({ weekStart }: { weekStart: Dayjs }) {
  const thisWeekMonday = dayjs().weekday(0)
  const lastMonday = weekStart.subtract(7, "day").format("YYYY-MM-DD")
  const nextMonday = weekStart.add(7, "day").format("YYYY-MM-DD")

  const lastMondayIsThisMonday = thisWeekMonday.diff(lastMonday, "day") === 0
  const nextMondayIsThisMonday = thisWeekMonday.diff(nextMonday, "day") === 0

  return (
    <div
      style={{
        paddingLeft: "16px",
        marginTop: "16px",
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <ButtonLink
        variant="outlined"
        to={lastMondayIsThisMonday ? "/" : "/calendar/" + lastMonday}
      >
        Prev
      </ButtonLink>
      <ButtonLink
        variant="outlined"
        to={nextMondayIsThisMonday ? "/" : "/calendar/" + nextMonday}
      >
        Next
      </ButtonLink>
    </div>
  )
}

interface MealProps {
  label: string
  isLoading: boolean
  error: unknown
  meal: domain.Meal | undefined
  randomize: () => void
  cheat: () => void
  style?: React.CSSProperties
}
function Meal({
  label,
  isLoading,
  error,
  meal,
  randomize,
  cheat,
  style,
}: MealProps) {
  function MealContent() {
    if (isLoading) return <LoadingText />
    if (error || !meal) return <>Couldn't load meal</>

    switch (meal.type) {
      case "recipe":
        return <>{meal.name}</>
      case "cheat":
        return <span style={{ color: "#dd2e44" }}>Cheat</span>
      default:
        return <span style={{ color: "#a7a7a7" }}>Nothing yet...</span>
    }
  }

  return (
    <Card style={style}>
      <CardContent style={{ paddingBottom: 0 }}>
        <Typography
          variant="subtitle1"
          style={{ fontSize: "0.857em", color: "#a7a7a7" }}
        >
          {label}
        </Typography>
        <Typography variant="h5" style={{ fontSize: "1.286em" }}>
          <MealContent />
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          color="inherit"
          type="submit"
          size="small"
          onClick={randomize}
          startIcon={<CasinoIcon />}
        >
          Randomize
        </Button>
        {meal?.type !== "cheat" && (
          <Button
            color="inherit"
            type="submit"
            size="small"
            onClick={cheat}
            startIcon={<BeachAccessIcon />}
          >
            Cheat
          </Button>
        )}
      </CardActions>
    </Card>
  )
}

function Day({ day }: { day: Dayjs }) {
  const date = day.format("YYYY-MM-DD")

  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  const { isLoading, error, data } = useQuery(
    [gateway.getDay.name, date],
    () => {
      return gateway.getDay(date)
    }
  )

  const { mutate: randomizeMeal } = useMutation(gateway.randomizeMeal, {
    onSuccess: () => {
      queryClient.invalidateQueries([gateway.getDay.name, date])
    },
    onError: () => {
      enqueueSnackbar("Failed to randomize meal", { variant: "error" })
    },
  })

  const { mutate: cheatMeal } = useMutation(gateway.cheatMeal, {
    onSuccess: () => {
      queryClient.invalidateQueries([gateway.getDay.name, date])
    },
    onError: () => {
      enqueueSnackbar("Failed to cheat meal", { variant: "error" })
    },
  })

  return (
    <div style={{ display: "flex", marginTop: "16px", marginBottom: "16px" }}>
      <div style={{ textAlign: "center", width: "5em" }}>
        <Typography
          component="div"
          style={{
            fontSize: "1.286em",
            color: day.isToday() ? "#DD2E44" : undefined,
          }}
        >
          {day.format("ddd")}
        </Typography>
        <Typography
          component="div"
          style={{ fontSize: "1.286em", color: "#a7a7a7" }}
        >
          {day.format("DD")}
        </Typography>
      </div>
      <div style={{ flexGrow: 1 }}>
        <Meal
          label="Lunch"
          isLoading={isLoading}
          error={error}
          meal={data?.lunch}
          randomize={() =>
            randomizeMeal({ isoDate: date, meal: "lunch", quick: true })
          }
          cheat={() => cheatMeal({ isoDate: date, meal: "lunch" })}
          style={{ marginBottom: "16px" }}
        />
        <Meal
          label="Dinner"
          isLoading={isLoading}
          error={error}
          meal={data?.dinner}
          randomize={() => randomizeMeal({ isoDate: date, meal: "dinner" })}
          cheat={() => cheatMeal({ isoDate: date, meal: "dinner" })}
        />
      </div>
    </div>
  )
}

export default function Calendar() {
  const { weekStart } = useParams<{ weekStart?: string }>()
  const weekStartDay = dayjs(weekStart).weekday(0)

  return (
    <Container maxWidth="sm" style={{ paddingLeft: 0, paddingBottom: "16px" }}>
      <ActionBar weekStart={weekStartDay} />
      {[...Array(7).keys()].map(dayOfTheWeek => {
        return (
          <Day key={dayOfTheWeek} day={weekStartDay.weekday(dayOfTheWeek)} />
        )
      })}
    </Container>
  )
}
