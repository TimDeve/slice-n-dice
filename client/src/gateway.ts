import dayjs from "dayjs"
import { Recipe, NewRecipe, Day } from "./domain"

interface GetRecipesResponse {
  recipes: {
    id: string
    name: string
  }[]
}

export async function getRecipes(): Promise<Recipe[]> {
  try {
    const res = await fetch("/api/v0/recipes")
    if (!res.ok) throw new Error("Failed to fetch recipes")
    const json: GetRecipesResponse = await res.json()
    return json.recipes.map(({ id, name }) => ({
      id,
      name,
    }))
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function createRecipe({ name }: NewRecipe): Promise<void> {
  try {
    const res = await fetch("/api/v0/recipes", {
      method: "POST",
      body: JSON.stringify({
        name,
      }),
    })
    if (!res.ok) throw new Error("Failed to create recipe")
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  try {
    const res = await fetch(`/api/v0/recipes/${recipeId}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete recipe")
  } catch (e) {
    console.error(e)
    throw e
  }
}

interface GetDayResponse {
  date: string
  lunch: Recipe | null
  dinner: Recipe | null
}

export async function getDay(isoDate: string): Promise<Day> {
  try {
    const res = await fetch(`/api/v0/days/${isoDate}`)
    if (!res.ok) throw new Error(`Failed to fetch day '${isoDate}'`)
    const json: GetDayResponse = await res.json()
    const { date, lunch, dinner } = json
    return {
      date: dayjs(date),
      lunch,
      dinner,
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function randomizeMeal({
  isoDate,
  meal,
}: {
  isoDate: string
  meal: "lunch" | "dinner"
}): Promise<Day> {
  try {
    const res = await fetch(`/api/v0/days/${isoDate}/${meal}/randomize`, {
      method: "PUT",
    })
    if (!res.ok) throw new Error("Failed to randomize ${}")
    const json: GetDayResponse = await res.json()
    const { date, lunch, dinner } = json
    return {
      date: dayjs(date),
      lunch,
      dinner,
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
