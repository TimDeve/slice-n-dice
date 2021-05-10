import { Recipe, NewRecipe } from "./domain"

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
