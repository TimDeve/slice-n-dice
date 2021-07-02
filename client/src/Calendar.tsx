import React, { useState, useRef, useEffect } from "react"
import { Dayjs } from "dayjs"
import { useSnackbar } from "notistack"
import { useMutation, useQuery, useQueryClient } from "react-query"
import Container from "@material-ui/core/Container"
import Card from "@material-ui/core/Card"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import CardContent from "@material-ui/core/CardContent"
import CardActions from "@material-ui/core/CardActions"
import CasinoIcon from "@material-ui/icons/Casino"
import dayjs from "./dayjs"

import { Recipe } from "./domain"
import * as gateway from "./gateway"

function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    let id = setInterval(() => {
      savedCallback.current?.()
    }, delay)
    return () => clearInterval(id)
  }, [delay])
}

function LoadingText() {
  const nonBreakingSpace = "\u00a0"
  const [hidden, setHidden] = useState(true)
  const [ellipsis, setEllipsis] = useState("...")

  useInterval(() => {
    if (hidden) {
      setHidden(false)
    } else {
      setEllipsis((elli) => {
        switch (elli) {
          case ".":
            return ".."
          case "..":
            return "..."
          case "...":
            return ""
          default:
            return "."
        }
      })
    }
  }, 500)

  return <>{hidden ? nonBreakingSpace : `Loading${ellipsis}`}</>
}

interface MealProps {
  label: string
  isLoading: boolean
  error: unknown
  meal: Recipe | null | undefined
  randomize: () => void
  style?: React.CSSProperties
}
function Meal({ label, isLoading, error, meal, randomize, style }: MealProps) {
  function MealContent() {
    if (isLoading) return <LoadingText />
    if (error) return <>Couldn't load meal</>

    return (
      <>
        {meal?.name || <span style={{ color: "#a7a7a7" }}>Nothing yet...</span>}
      </>
    )
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
          type="submit"
          size="small"
          onClick={randomize}
          startIcon={<CasinoIcon />}
        >
          Randomize
        </Button>
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

  const { mutateAsync: randomizeMeal } = useMutation(gateway.randomizeMeal, {
    onSuccess: () => {
      queryClient.invalidateQueries([gateway.getDay.name, date])
    },
    onError: () => {
      enqueueSnackbar("Failed to randomize meal", { variant: "error" })
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
          randomize={() => randomizeMeal({ isoDate: date, meal: "lunch" })}
          style={{ marginBottom: "16px" }}
        />
        <Meal
          label="Dinner"
          isLoading={isLoading}
          error={error}
          meal={data?.dinner}
          randomize={() => randomizeMeal({ isoDate: date, meal: "dinner" })}
        />
      </div>
    </div>
  )
}

export default function Calendar() {
  return (
    <Container maxWidth="sm" style={{ paddingLeft: 0 }}>
      {[...Array(7).keys()].map((dayOfTheWeek) => {
        return <Day key={dayOfTheWeek} day={dayjs().weekday(dayOfTheWeek)} />
      })}
    </Container>
  )
}
