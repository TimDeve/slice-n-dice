use rand::seq::SliceRandom;
use sqlx::{Executor, Postgres};
use time::Date;
use uuid::Uuid;

use crate::domain::{Day, Meal, NewRecipe, Recipe};

pub trait PgExecutor<'a>: Executor<'a, Database = Postgres> + Clone {}
impl<'a, T> PgExecutor<'a> for T where T: Executor<'a, Database = Postgres> + Clone {}

pub async fn get_recipes<'a, E: PgExecutor<'a>>(exec: E) -> anyhow::Result<Vec<Recipe>> {
    let recipes = sqlx::query_as(
        "SELECT *
         FROM recipes
         ORDER BY name",
    )
    .fetch_all(exec)
    .await?;

    Ok(recipes)
}

pub async fn get_recipe<'a, E: PgExecutor<'a>>(
    exec: E,
    id: Uuid,
) -> anyhow::Result<Option<Recipe>> {
    let recipe = sqlx::query_as(
        "SELECT *
         FROM recipes
         WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(exec)
    .await?;

    Ok(recipe)
}

pub async fn create_recipe<'a, E: PgExecutor<'a>>(
    exec: E,
    recipe: NewRecipe,
) -> anyhow::Result<Recipe> {
    let created_recipe = sqlx::query_as(
        "INSERT INTO recipes ( name )
         VALUES ( $1 )
         RETURNING *",
    )
    .bind(&recipe.name)
    .fetch_one(exec)
    .await?;

    Ok(created_recipe)
}

pub async fn delete_recipe<'a, E: PgExecutor<'a>>(exec: E, id: Uuid) -> anyhow::Result<()> {
    sqlx::query("DELETE FROM recipes WHERE id = $1")
        .bind(id)
        .execute(exec)
        .await?;

    Ok(())
}

#[derive(sqlx::FromRow)]
pub struct DayDb {
    pub date: Date,
    pub lunch_id: Option<Uuid>,
    pub dinner_id: Option<Uuid>,
}

pub async fn get_day<'a, E: PgExecutor<'a>>(exec: E, date: Date) -> anyhow::Result<Day> {
    let maybe_daydb: Option<DayDb> = sqlx::query_as(
        "SELECT *
         FROM days
         WHERE date = $1",
    )
    .bind(date)
    .fetch_optional(exec.clone())
    .await?;

    if let Some(daydb) = maybe_daydb {
        let mut day = Day {
            date: daydb.date,
            lunch: Option::None,
            dinner: Option::None,
        };

        if let Some(lunch_id) = daydb.lunch_id {
            day.lunch = get_recipe(exec.clone(), lunch_id).await?;
        }

        if let Some(dinner_id) = daydb.dinner_id {
            day.dinner = get_recipe(exec.clone(), dinner_id).await?;
        }

        Ok(day)
    } else {
        Ok(Day {
            date,
            lunch: Option::None,
            dinner: Option::None,
        })
    }
}

pub async fn randomize_meal<'a, E: PgExecutor<'a>>(
    exec: E,
    date: Date,
    meal: Meal,
) -> anyhow::Result<Day> {
    let recipes = get_recipes(exec.clone()).await?;

    match meal {
        Meal::Lunch => {
            let maybe_recipe = recipes.choose(&mut rand::thread_rng());
            if let Some(recipe) = maybe_recipe {
                let day: DayDb = sqlx::query_as(
                    "INSERT INTO days (date, lunch_id)
                     VALUES ($1, $2)
                     ON CONFLICT (date) DO
                     UPDATE SET lunch_id = $2
                     RETURNING *",
                )
                .bind(date)
                .bind(recipe.id)
                .fetch_one(exec.clone())
                .await?;

                Ok(get_day(exec, day.date).await?)
            } else {
                Ok(Day {
                    date,
                    lunch: Option::None,
                    dinner: Option::None,
                })
            }
        }
        Meal::Dinner => {
            let maybe_recipe = recipes.choose(&mut rand::thread_rng());
            if let Some(recipe) = maybe_recipe {
                let day: DayDb = sqlx::query_as(
                    "INSERT INTO days (date, dinner_id)
                     VALUES ($1, $2)
                     ON CONFLICT (date) DO
                     UPDATE SET dinner_id = $2
                     RETURNING *",
                )
                .bind(date)
                .bind(recipe.id)
                .fetch_one(exec.clone())
                .await?;

                Ok(get_day(exec, day.date).await?)
            } else {
                Ok(Day {
                    date,
                    lunch: Option::None,
                    dinner: Option::None,
                })
            }
        }
        Meal::Both => {
            let recipes = (
                recipes.choose(&mut rand::thread_rng()),
                recipes.choose(&mut rand::thread_rng()),
            );
            if let (Some(lunch_recipe), Some(dinner_recipe)) = recipes {
                let day: DayDb = sqlx::query_as(
                    "INSERT INTO days (date, lunch_id, dinner_id)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (date) DO
                     UPDATE SET lunch_id = $2, dinner_id = $3
                     RETURNING *",
                )
                .bind(date)
                .bind(lunch_recipe.id)
                .bind(dinner_recipe.id)
                .fetch_one(exec.clone())
                .await?;

                Ok(get_day(exec, day.date).await?)
            } else {
                Ok(Day {
                    date,
                    lunch: Option::None,
                    dinner: Option::None,
                })
            }
        }
    }
}
