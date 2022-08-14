import { Dayjs } from "dayjs"
import { RawDraftContentState } from "draft-js"

export interface Recipe {
  id: string
  name: string
  quick: boolean
}

export interface NewRecipe {
  name: string
  quick: boolean
  body: RawDraftContentState
}

export interface RecipeMeal extends Recipe {
  type: "recipe"
}

export interface CheatMeal {
  type: "cheat"
}

export interface UnsetMeal {
  type: "unset"
}

export type Meal = RecipeMeal | CheatMeal | UnsetMeal

export interface Day {
  date: Dayjs
  lunch: Meal
  dinner: Meal
}

export interface Food {
  id: number
  name: string
  bestBeforeDate: Dayjs
}

export interface NewFood {
  name: string
  bestBeforeDate: Dayjs
}
