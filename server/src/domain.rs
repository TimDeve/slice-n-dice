use serde::{Deserialize, Serialize};
use sqlx::types::{Json, JsonRawValue};
use time::Date;
use uuid::Uuid;

use crate::serde_iso_date;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewRecipe {
    pub name: String,
    pub quick: bool,
    pub body: Json<Box<JsonRawValue>>,
}

#[derive(Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Recipe {
    pub id: Uuid,
    pub name: String,
    pub quick: bool,
    pub body: Json<Box<JsonRawValue>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Day {
    #[serde(with = "serde_iso_date")]
    pub date: Date,
    pub lunch: Meal,
    pub dinner: Meal,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "type")]
pub enum Meal {
    Recipe(Recipe),
    Cheat,
    Unset,
}

pub enum MealType {
    Lunch,
    Dinner,
    Both,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewFood {
    pub name: String,
    #[serde(with = "serde_iso_date")]
    pub best_before_date: Date,
}

#[derive(Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Food {
    pub id: i32,
    pub name: String,
    #[serde(with = "serde_iso_date")]
    pub best_before_date: Date,
}
