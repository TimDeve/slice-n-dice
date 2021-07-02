import dayjs from "dayjs"
import axios from "axios"

import { Recipe, NewRecipe, Day } from "./domain"

export async function logIn({
  username,
  password,
}: {
  username: string
  password: string
}) {
  try {
    await axios.post("/api/v0/login", {
      username,
      password,
    })
  } catch (e) {
    console.error(e)
    throw new Error("Failed to login")
  }
}

interface GetRecipesResponse {
  recipes: {
    id: string
    name: string
  }[]
}

export async function getRecipes(): Promise<Recipe[]> {
  try {
    const res = await axios.get<GetRecipesResponse>("/api/v0/recipes")
    return res.data.recipes.map(({ id, name }) => ({
      id,
      name,
    }))
  } catch (e) {
    console.error(e)
    throw new Error("Failed to fetch recipes")
  }
}

export async function createRecipe({ name }: NewRecipe): Promise<void> {
  try {
    await axios.post("/api/v0/recipes", {
      name,
    })
  } catch (e) {
    console.error(e)
    throw new Error("Failed to create recipe")
  }
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  try {
    await axios.delete(`/api/v0/recipes/${recipeId}`)
  } catch (e) {
    console.error(e)
    throw new Error("Failed to delete recipe")
  }
}

interface GetDayResponse {
  date: string
  lunch: Recipe | null
  dinner: Recipe | null
}

export async function getDay(isoDate: string): Promise<Day> {
  try {
    const res = await axios.get<GetDayResponse>(`/api/v0/days/${isoDate}`)
    const { date, lunch, dinner } = res.data
    return {
      date: dayjs(date),
      lunch,
      dinner,
    }
  } catch (e) {
    console.error(e)
    throw new Error(`Failed to fetch day '${isoDate}'`)
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
    const res = await axios.put<GetDayResponse>(
      `/api/v0/days/${isoDate}/${meal}/randomize`
    )
    const { date, lunch, dinner } = res.data
    return {
      date: dayjs(date),
      lunch,
      dinner,
    }
  } catch (e) {
    console.error(e)
    throw new Error(`Failed to randomize ${isoDate}`)
  }
}
