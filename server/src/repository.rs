use crate::domain::{Day, NewRecipe, Recipe};
use sqlx::{Executor, Postgres};
use time::Date;
use uuid::Uuid;

pub trait PgExecutor<'a>: Executor<'a, Database = Postgres> {}
impl<'a, T> PgExecutor<'a> for T where T: Executor<'a, Database = Postgres> {}

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
    .fetch_optional(exec)
    .await?;

    if let Some(daydb) = maybe_daydb  {
        Ok(Day {
            date: daydb.date,
            lunch: Option::None,
            dinner: Option::None,
        })
    } else {
        Ok(Day {
            date,
            lunch: Option::None,
            dinner: Option::None,
        })
    }
}
