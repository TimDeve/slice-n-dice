use serde::{Deserialize, Serialize};
use tide::{Body, Request, Response, Server, StatusCode};

use super::repository;
use crate::domain::{Food, NewFood};
use crate::tide_utils::parse_param;
use crate::AppContext;

pub fn init(app: &mut Server<AppContext>) {
    let mut foods_api = app.at("/api/v0/foods");
    foods_api.get(get_foods);
    foods_api.post(create_food);
    foods_api.at("/:id").delete(delete_food);
}

#[derive(Deserialize)]
struct GetFoodQueryParams {
    limit: Option<i32>,
}

#[derive(Serialize)]
struct GetFoodResponse {
    foods: Vec<Food>,
}

async fn get_foods(req: Request<AppContext>) -> tide::Result<Body> {
    let query: GetFoodQueryParams = req.query()?;
    let limit = query.limit.unwrap_or(500);
    let foods = repository::get_foods(&req.state().pool, limit).await?;
    Body::from_json(&GetFoodResponse { foods })
}

async fn create_food(mut req: Request<AppContext>) -> tide::Result<Response> {
    let new_food: NewFood = req.body_json().await?;
    let created_food = repository::create_food(&req.state().pool, new_food).await?;

    let body = Body::from_json(&created_food)?;
    Ok(Response::builder(StatusCode::Created).body(body).build())
}

async fn delete_food(req: Request<AppContext>) -> tide::Result<Response> {
    let food_id = parse_param(&req, "id")?;
    repository::delete_food(&req.state().pool, food_id).await?;
    Ok(Response::new(StatusCode::NoContent))
}
