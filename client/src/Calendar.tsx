import { Dayjs } from "dayjs"
import { useSnackbar } from "notistack"
import { useMutation, useQuery, useQueryClient } from "react-query"

import dayjs from "./dayjs"
import { Recipe } from "./domain"
import * as gateway from "./gateway"

function Meal({
  isLoading,
  error,
  meal,
  randomize,
}: {
  isLoading: boolean
  error: unknown
  meal: Recipe | null | undefined
  randomize: () => void
}) {
  if (isLoading) return <>loading...</>
  if (error) return <>Couldn't load meal</>

  return (
    <>
      {meal?.name || "Nothing yet..."}
      <button onClick={randomize}>Randomize me!</button>
    </>
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
    <li>
      {day.format("LL")}
      <br />
      Lunch:{" "}
      <Meal
        isLoading={isLoading}
        error={error}
        meal={data?.lunch}
        randomize={() => randomizeMeal({ isoDate: date, meal: "lunch" })}
      />
      <br />
      Dinner:{" "}
      <Meal
        isLoading={isLoading}
        error={error}
        meal={data?.dinner}
        randomize={() => randomizeMeal({ isoDate: date, meal: "dinner" })}
      />
    </li>
  )
}

export default function Calendar() {
  return (
    <ul>
      {[...Array(7).keys()].map((dayOfTheWeek) => {
        return <Day key={dayOfTheWeek} day={dayjs().weekday(dayOfTheWeek)} />
      })}
    </ul>
  )
}
