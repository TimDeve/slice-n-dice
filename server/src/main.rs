mod days;
mod domain;
mod foods;
mod recipes;
mod serde_date;
mod tide_utils;

use anyhow::{Context, Result};
use sqlx::postgres::PgPool;
use std::env;
use tide::Server;

#[derive(Clone)]
pub struct AppContext {
    pool: PgPool,
}

#[async_std::main]
async fn main() -> Result<()> {
    let database_url =
        env::var("DATABASE_URL").context("DATABASE_URL env variable needs to be set")?;
    let pool = PgPool::connect(&database_url).await?;

    sqlx::migrate!().run(&pool).await?;

    tide::log::start();
    let mut app = Server::with_state(AppContext { pool });

    days::handlers::init(&mut app);
    recipes::handlers::init(&mut app);
    foods::handlers::init(&mut app);

    app.listen("127.0.0.1:8091").await?;

    Ok(())
}
