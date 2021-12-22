use crate::domain::{Food, NewFood};
use sqlx::{Executor, Postgres};

pub trait PgExecutor<'a>: Executor<'a, Database = Postgres> {}
impl<'a, T> PgExecutor<'a> for T where T: Executor<'a, Database = Postgres> {}

pub async fn get_foods<'a, E: PgExecutor<'a>>(exec: E, limit: u32) -> anyhow::Result<Vec<Food>> {
    let foods = sqlx::query_as(
        "SELECT *
         FROM foods
         ORDER BY best_before_date ASC
         LIMIT $1",
    )
    .bind(limit)
    .fetch_all(exec)
    .await?;

    Ok(foods)
}

pub async fn create_food<'a, E: PgExecutor<'a>>(exec: E, food: NewFood) -> anyhow::Result<Food> {
    let created_food = sqlx::query_as(
        "INSERT INTO foods ( name, best_before_date )
         VALUES ( $1, $2 )
         RETURNING *",
    )
    .bind(&food.name)
    .bind(&food.best_before_date)
    .fetch_one(exec)
    .await?;

    Ok(created_food)
}

pub async fn delete_food<'a, E: PgExecutor<'a>>(exec: E, id: i32) -> anyhow::Result<()> {
    sqlx::query("DELETE FROM foods WHERE id = $1")
        .bind(id)
        .execute(exec)
        .await?;

    Ok(())
}
