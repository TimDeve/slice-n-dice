import { Dayjs } from "dayjs"

export interface Recipe {
  id: string
  name: string
}

export interface NewRecipe {
  name: string
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
