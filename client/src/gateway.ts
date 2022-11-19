import axios from "axios"
import dayjs from "dayjs"

import { isAxiosResponseError } from "./axiosHelpers"
import {
  Day,
  Food,
  LightRecipe,
  Meal,
  NewFood,
  NewRecipe,
  Recipe,
} from "./domain"

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

export async function logOut() {
  try {
    await axios.post("/api/v0/logout")
  } catch (e) {
    if (!(isAxiosResponseError(e) && e.response.status === 401)) {
      console.error(e)
      throw new Error("Failed to logout")
    }
  }
}

interface GetRecipesResponse {
  recipes: {
    id: string
    name: string
    quick: boolean
  }[]
}

export async function getRecipes(): Promise<LightRecipe[]> {
  try {
    const res = await axios.get<GetRecipesResponse>("/api/v0/recipes")
    return res.data.recipes.map(({ id, name, quick }) => ({
      id,
      name,
      quick,
    }))
  } catch (e) {
    console.error(e)
    throw new Error("Failed to fetch recipes")
  }
}

export async function getRecipe(id: string): Promise<Recipe> {
  try {
    const res = await axios.get<Recipe>(`/api/v0/recipes/${id}`)
    const { name, quick, body } = res.data
    return { id, name, quick, body }
  } catch (e) {
    console.error(e)
    throw new Error("Failed to fetch recipe")
  }
}

export async function createRecipe({
  name,
  quick,
  body,
}: NewRecipe): Promise<void> {
  try {
    await axios.post("/api/v0/recipes", {
      name,
      quick,
      body,
    })
  } catch (e) {
    console.error(e)
    throw new Error("Failed to create recipe")
  }
}

export async function updateRecipe(r: Recipe): Promise<void> {
  try {
    await axios.put(`/api/v0/recipes/${r.id}`, r)
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
  lunch: Meal
  dinner: Meal
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
  quick = false,
}: {
  isoDate: string
  meal: "lunch" | "dinner"
  quick?: boolean
}): Promise<Day> {
  try {
    const res = await axios.put<GetDayResponse>(
      `/api/v0/days/${isoDate}/${meal}/randomize`,
      null,
      { params: { quick } }
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

export async function cheatMeal({
  isoDate,
  meal,
}: {
  isoDate: string
  meal: "lunch" | "dinner"
}): Promise<Day> {
  try {
    const res = await axios.put<GetDayResponse>(
      `/api/v0/days/${isoDate}/${meal}/cheat`
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

interface GetFoodsResponse {
  foods: {
    id: number
    name: string
    bestBeforeDate: string
  }[]
}

export async function getFoods(): Promise<Food[]> {
  try {
    const res = await fetch("/api/v0/foods")
    if (!res.ok) throw new Error("Failed to fetch foods")
    const json: GetFoodsResponse = await res.json()
    return json.foods.map(({ id, name, bestBeforeDate }) => ({
      id,
      name,
      bestBeforeDate: dayjs(bestBeforeDate),
    }))
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function createFood({
  name,
  bestBeforeDate,
}: NewFood): Promise<void> {
  try {
    const res = await fetch("/api/v0/foods", {
      method: "POST",
      body: JSON.stringify({
        name,
        bestBeforeDate: bestBeforeDate.format("YYYY-MM-DD"),
      }),
    })
    if (!res.ok) throw new Error("Failed to create food")
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function deleteFood(foodId: number): Promise<void> {
  try {
    const res = await fetch(`/api/v0/foods/${foodId}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete food")
  } catch (e) {
    console.error(e)
    throw e
  }
}
