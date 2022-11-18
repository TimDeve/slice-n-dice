use sqlx::{Executor, Postgres};

use uuid::Uuid;

use crate::{
    domain::{NewRecipe, Recipe},
    html_filter,
};

pub trait PgExecutor<'a>: Executor<'a, Database = Postgres> + Clone {}
impl<'a, T> PgExecutor<'a> for T where T: Executor<'a, Database = Postgres> + Clone {}

pub async fn get_recipes<'a, E: PgExecutor<'a>>(
    exec: E,
    query: Option<&str>,
    limit: Option<i64>,
    quick: Option<bool>,
) -> anyhow::Result<Vec<Recipe>> {
    let recipes = sqlx::query_as(
        "
         SELECT *
         FROM recipes
         WHERE ($1 IS NULL OR similarity(name, $1) > 0.1)
           AND ($3 IS NULL OR quick = $3)
         ORDER BY
           CASE WHEN $1 IS NOT NULL
                THEN similarity(name, $1)
           END DESC,
           name ASC
         LIMIT $2
         ",
    )
    .bind(query)
    .bind(limit)
    .bind(quick)
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

pub async fn get_random_recipe<'a, E: PgExecutor<'a>>(
    exec: E,
    quick: bool,
) -> anyhow::Result<Option<Recipe>> {
    let recipe = sqlx::query_as(
        "
        WITH all_meals AS (
            SELECT lunch_id AS id FROM days WHERE lunch_id IS NOT NULL
            UNION ALL
            SELECT dinner_id AS id FROM days WHERE dinner_id IS NOT NULL
        ), frequencies AS (
            SELECT id, count(id) AS frequency FROM all_meals GROUP BY id
        )
        SELECT r.*, coalesce(f.frequency, 0.5) AS frequency FROM frequencies f
        FULL OUTER JOIN recipes r ON f.id = r.id
        WHERE quick = true
           OR quick = $1
        ORDER BY log(random()) / coalesce(f.frequency, 0.5)
        LIMIT 1
        ",
    )
    .bind(quick)
    .fetch_optional(exec)
    .await?;

    Ok(recipe)
}

pub async fn create_recipe<'a, E: PgExecutor<'a>>(
    exec: E,
    recipe: NewRecipe,
) -> anyhow::Result<Recipe> {
    let created_recipe = sqlx::query_as(
        "INSERT INTO recipes ( name, quick, body_html, body_plain_text )
         VALUES ( $1, $2, $3, $4 )
         RETURNING *",
    )
    .bind(&recipe.name)
    .bind(&recipe.quick)
    .bind(&recipe.body)
    .bind(&html_filter::to_plain_text(&recipe.body)?)
    .fetch_one(exec)
    .await?;

    Ok(created_recipe)
}

pub async fn update_recipe<'a, E: PgExecutor<'a>>(
    exec: E,
    recipe: Recipe,
) -> anyhow::Result<Recipe> {
    let created_recipe = sqlx::query_as(
        "UPDATE recipes
         SET name = $2, quick = $3, body_html = $4, body_plain_text = $5
         WHERE id = $1
         RETURNING *",
    )
    .bind(&recipe.id)
    .bind(&recipe.name)
    .bind(&recipe.quick)
    .bind(&recipe.body)
    .bind(&html_filter::to_plain_text(&recipe.body)?)
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
