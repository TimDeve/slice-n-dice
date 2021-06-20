import { Dayjs } from "dayjs"

export interface Recipe {
  id: string
  name: string
}

export interface NewRecipe {
  name: string
}

export interface Day {
  date: Dayjs
  lunch: Recipe | null
  dinner: Recipe | null
}
