use serde::Deserialize;
use tide::{Body, Request, Server};

use crate::days::repository;
use crate::domain::MealType;
use crate::tide_utils::parse_iso_date_param;
use crate::AppContext;

pub fn init(app: &mut Server<AppContext>) {
    let mut days_api = app.at("/api/v0/days");
    days_api.at("/:date").get(get_day);
    days_api.at("/:date/randomize").put(randomize_day);
    days_api.at("/:date/lunch/randomize").put(randomize_lunch);
    days_api.at("/:date/dinner/randomize").put(randomize_dinner);
    days_api.at("/:date/lunch/cheat").put(cheat_lunch);
    days_api.at("/:date/dinner/cheat").put(cheat_dinner);
}

async fn get_day(req: Request<AppContext>) -> tide::Result<Body> {
    let date = parse_iso_date_param(&req, "date")?;
    let day = repository::get_day(&req.state().pool, date).await?;
    Body::from_json(&day)
}

#[derive(Deserialize)]
struct RandomizeQuery {
    #[serde(default)]
    quick: bool,
}

async fn randomize_day(req: Request<AppContext>) -> tide::Result<Body> {
    let query: RandomizeQuery = req.query()?;
    let date = parse_iso_date_param(&req, "date")?;
    let day =
        repository::randomize_meal(&req.state().pool, date, MealType::Both, query.quick).await?;
    Body::from_json(&day)
}

async fn randomize_lunch(req: Request<AppContext>) -> tide::Result<Body> {
    let query: RandomizeQuery = req.query()?;
    let date = parse_iso_date_param(&req, "date")?;
    let day =
        repository::randomize_meal(&req.state().pool, date, MealType::Lunch, query.quick).await?;
    Body::from_json(&day)
}

async fn randomize_dinner(req: Request<AppContext>) -> tide::Result<Body> {
    let query: RandomizeQuery = req.query()?;
    let date = parse_iso_date_param(&req, "date")?;
    let day =
        repository::randomize_meal(&req.state().pool, date, MealType::Dinner, query.quick).await?;
    Body::from_json(&day)
}

async fn cheat_lunch(req: Request<AppContext>) -> tide::Result<Body> {
    let date = parse_iso_date_param(&req, "date")?;
    let day = repository::cheat_meal(&req.state().pool, date, MealType::Lunch).await?;
    Body::from_json(&day)
}

async fn cheat_dinner(req: Request<AppContext>) -> tide::Result<Body> {
    let date = parse_iso_date_param(&req, "date")?;
    let day = repository::cheat_meal(&req.state().pool, date, MealType::Dinner).await?;
    Body::from_json(&day)
}
