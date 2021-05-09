use std::{error::Error, fmt::Display};

use serde::Serialize;
use tide::{Body, Request, Response, Server, StatusCode};
use time::Date;

use crate::{
    domain::{Meal, NewRecipe, Recipe},
    repository, AppContext,
};

pub fn init(app: &mut Server<AppContext>) {
    let mut recipes_api = app.at("/api/v0/recipes");
    recipes_api.get(get_recipes);
    recipes_api.post(create_recipe);
    recipes_api.at("/:id").delete(delete_recipe);

    let mut days_api = app.at("/api/v0/days");
    days_api.at("/:date").get(get_day);
    days_api.at("/:date/randomize").put(randomize_meal);
    days_api.at("/:date/lunch/randomize").put(randomize_lunch);
    days_api.at("/:date/dinner/randomize").put(randomize_dinner);
}

#[derive(Serialize)]
struct GetRecipesResponse {
    recipes: Vec<Recipe>,
}

async fn get_recipes(req: Request<AppContext>) -> tide::Result<Body> {
    let recipes = repository::get_recipes(&req.state().pool).await?;
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

async fn get_day(req: Request<AppContext>) -> tide::Result<Body> {
    let date = parse_iso_date_param(&req, "date")?;
    let day = repository::get_day(&req.state().pool, date).await?;
    Body::from_json(&day)
}

async fn randomize_meal(req: Request<AppContext>) -> tide::Result<Body> {
    let date = parse_iso_date_param(&req, "date")?;
    let day = repository::randomize_meal(&req.state().pool, date, Meal::Both).await?;
    Body::from_json(&day)
}

async fn randomize_lunch(req: Request<AppContext>) -> tide::Result<Body> {
    let date = parse_iso_date_param(&req, "date")?;
    let day = repository::randomize_meal(&req.state().pool, date, Meal::Lunch).await?;
    Body::from_json(&day)
}

async fn randomize_dinner(req: Request<AppContext>) -> tide::Result<Body> {
    let date = parse_iso_date_param(&req, "date")?;
    let day = repository::randomize_meal(&req.state().pool, date, Meal::Dinner).await?;
    Body::from_json(&day)
}

fn parse_iso_date_param(req: &Request<AppContext>, param: &str) -> Result<Date, tide::Error> {
    let iso_date_format = "%F";
    Date::parse(req.param(param)?, iso_date_format).map_err(|err| {
        tide::Error::new(
            StatusCode::BadRequest,
            anyhow::Error::new(err).context(format!("Failed to parse url param '{}'", param)),
        )
    })
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
