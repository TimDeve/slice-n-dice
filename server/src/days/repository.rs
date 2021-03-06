use sqlx::{Executor, Postgres};
use time::Date;
use uuid::Uuid;

use crate::domain::{Day, Meal, MealType};
use crate::recipes::repository::{get_random_recipe, get_recipe};

pub trait PgExecutor<'a>: Executor<'a, Database = Postgres> + Clone {}
impl<'a, T> PgExecutor<'a> for T where T: Executor<'a, Database = Postgres> + Clone {}

#[derive(sqlx::FromRow)]
pub struct DayDb {
    pub date: Date,
    pub lunch_id: Option<Uuid>,
    pub dinner_id: Option<Uuid>,
    pub lunch_is_cheat: bool,
    pub dinner_is_cheat: bool,
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
            lunch: Meal::Unset,
            dinner: Meal::Unset,
        };

        if let Some(lunch_id) = daydb.lunch_id {
            day.lunch = match get_recipe(exec.clone(), lunch_id).await? {
                Option::Some(recipe) => Meal::Recipe(recipe),
                Option::None => Meal::Unset,
            };
        } else if daydb.lunch_is_cheat {
            day.lunch = Meal::Cheat;
        }

        if let Some(dinner_id) = daydb.dinner_id {
            day.dinner = match get_recipe(exec.clone(), dinner_id).await? {
                Option::Some(recipe) => Meal::Recipe(recipe),
                Option::None => Meal::Unset,
            };
        } else if daydb.dinner_is_cheat {
            day.dinner = Meal::Cheat;
        }

        Ok(day)
    } else {
        Ok(Day {
            date,
            lunch: Meal::Unset,
            dinner: Meal::Unset,
        })
    }
}

pub async fn randomize_meal<'a, E: PgExecutor<'a>>(
    exec: E,
    date: Date,
    meal: MealType,
    quick: bool,
) -> anyhow::Result<Day> {
    match meal {
        MealType::Lunch => {
            let maybe_recipe = get_random_recipe(exec.clone(), quick).await?;
            if let Some(recipe) = maybe_recipe {
                let day: DayDb = sqlx::query_as(
                    "INSERT INTO days (date, lunch_id, lunch_is_cheat)
                     VALUES ($1, $2, False)
                     ON CONFLICT (date) DO
                     UPDATE SET lunch_id = $2, lunch_is_cheat = False
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
                    lunch: Meal::Unset,
                    dinner: Meal::Unset,
                })
            }
        }
        MealType::Dinner => {
            let maybe_recipe = get_random_recipe(exec.clone(), quick).await?;
            if let Some(recipe) = maybe_recipe {
                let day: DayDb = sqlx::query_as(
                    "INSERT INTO days (date, dinner_id, dinner_is_cheat)
                     VALUES ($1, $2, False)
                     ON CONFLICT (date) DO
                     UPDATE SET dinner_id = $2, dinner_is_cheat = False
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
                    lunch: Meal::Unset,
                    dinner: Meal::Unset,
                })
            }
        }
        MealType::Both => {
            let recipes = (
                get_random_recipe(exec.clone(), quick).await?,
                get_random_recipe(exec.clone(), quick).await?,
            );
            if let (Some(lunch_recipe), Some(dinner_recipe)) = recipes {
                let day: DayDb = sqlx::query_as(
                    "INSERT INTO days (date, lunch_id, lunch_is_cheat, dinner_id, dinner_is_cheat)
                     VALUES ($1, $2, False, $3, False)
                     ON CONFLICT (date) DO
                     UPDATE SET lunch_id = $2, lunch_is_cheat = False, dinner_id = $3, dinner_is_cheat = False
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
                    lunch: Meal::Unset,
                    dinner: Meal::Unset,
                })
            }
        }
    }
}

pub async fn cheat_meal<'a, E: PgExecutor<'a>>(
    exec: E,
    date: Date,
    meal: MealType,
) -> anyhow::Result<Day> {
    match meal {
        MealType::Lunch => {
            let day: DayDb = sqlx::query_as(
                "INSERT INTO days (date, lunch_id, lunch_is_cheat)
                 VALUES ($1, Null, True)
                 ON CONFLICT (date) DO
                 UPDATE SET lunch_id = Null, lunch_is_cheat = True
                 RETURNING *",
            )
            .bind(date)
            .fetch_one(exec.clone())
            .await?;

            Ok(get_day(exec, day.date).await?)
        }
        MealType::Dinner => {
            let day: DayDb = sqlx::query_as(
                "INSERT INTO days (date, dinner_id, dinner_is_cheat)
                 VALUES ($1, Null, True)
                 ON CONFLICT (date) DO
                 UPDATE SET dinner_id = Null, dinner_is_cheat = True
                 RETURNING *",
            )
            .bind(date)
            .fetch_one(exec.clone())
            .await?;

            Ok(get_day(exec, day.date).await?)
        }
        MealType::Both => {
            let day: DayDb = sqlx::query_as(
                "INSERT INTO days (date, lunch_id, lunch_is_cheat, dinner_id, dinner_is_cheat)
                 VALUES ($1, Null, True, Null, True)
                 ON CONFLICT (date) DO
                 UPDATE SET lunch_id = Null, lunch_is_cheat = True, lunch_id = Null, lunch_is_cheat = True
                 RETURNING *",
            )
            .bind(date)
            .fetch_one(exec.clone())
            .await?;

            Ok(get_day(exec, day.date).await?)
        }
    }
}
