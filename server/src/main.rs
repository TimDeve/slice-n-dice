use anyhow::{Context, Result};
use slice_n_dice_server::init_app;
use sqlx::postgres::PgPool;
use std::env;

#[async_std::main]
async fn main() -> Result<()> {
    let database_url =
        env::var("DATABASE_URL").context("DATABASE_URL env variable needs to be set")?;
    let pool = PgPool::connect(&database_url).await?;

    sqlx::migrate!().run(&pool).await?;

    tide::log::start();

    let app = init_app(pool);

    app.listen("127.0.0.1:8091").await?;

    Ok(())
}
