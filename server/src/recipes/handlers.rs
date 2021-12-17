use std::{error::Error, fmt::Display};

use serde::{Deserialize, Serialize};
use tide::{Body, Request, Response, Server, StatusCode};

use crate::{
    domain::{NewRecipe, Recipe},
    recipes::repository,
    AppContext,
};

pub fn init(app: &mut Server<AppContext>) {
    let mut recipes_api = app.at("/api/v0/recipes");
    recipes_api.get(get_recipes);
    recipes_api.post(create_recipe);
    recipes_api.at("/:id").delete(delete_recipe);
}

#[derive(Serialize)]
struct GetRecipesResponse {
    recipes: Vec<Recipe>,
}

#[derive(Deserialize)]
struct GetRecipesQuery {
    #[serde(default)]
    search: Option<String>,
    #[serde(default)]
    limit: Option<i64>,
    #[serde(default)]
    quick: Option<bool>,
}

async fn get_recipes(req: Request<AppContext>) -> tide::Result<Body> {
    let query: GetRecipesQuery = req.query()?;
    let recipes = repository::get_recipes(
        &req.state().pool,
        query.search.as_deref(),
        query.limit,
        query.quick,
    )
    .await?;
    Body::from_json(&GetRecipesResponse { recipes })
}

async fn create_recipe(mut req: Request<AppContext>) -> tide::Result<Body> {
    let new_recipe: NewRecipe = req.body_json().await?;
    let created_recipe = repository::create_recipe(&req.state().pool, new_recipe).await?;
    Body::from_json(&created_recipe)
}

async fn delete_recipe(req: Request<AppContext>) -> tide::Result<Response> {
    let recipe_id = parse_param(&req, "id")?;
    repository::delete_recipe(&req.state().pool, recipe_id).await?;
    Ok(Response::new(StatusCode::NoContent))
}

fn parse_param<T>(req: &Request<AppContext>, param: &str) -> Result<T, tide::Error>
where
    T: std::str::FromStr,
    <T as std::str::FromStr>::Err: Display + Sync + Send + Error + 'static,
{
    req.param(param)?.parse().map_err(|err| {
        tide::Error::new(
            StatusCode::BadRequest,
            anyhow::Error::new(err).context(format!("Failed to parse url param '{}'", param)),
        )
    })
}
