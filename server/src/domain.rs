use serde::{Deserialize, Serialize};
use time::Date;
use uuid::Uuid;

use crate::serde_date;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewRecipe {
    pub name: String,
}

#[derive(Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Recipe {
    pub id: Uuid,
    pub name: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Day {
    #[serde(with = "serde_date")]
    pub date: Date,
    pub lunch: Option<Recipe>,
    pub dinner: Option<Recipe>,
}
