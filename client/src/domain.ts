import { Dayjs } from "dayjs"

export interface LightRecipe {
  id: string
  name: string
  quick: boolean
}

export interface Recipe extends LightRecipe {
  body: string
}

export type NewRecipe = Omit<Recipe, "id">

export interface RecipeMeal extends LightRecipe {
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
