mod days;
mod domain;
mod foods;
mod recipes;
mod tide_utils;

use sqlx::postgres::PgPool;
use tide::Server;
use time::serde::format_description;

format_description!(
    serde_iso_date,
    Date,
    "[year repr:full]-[month padding:zero]-[day]"
);

#[derive(Clone)]
pub struct AppContext {
    pool: PgPool,
}

pub fn init_app(pool: PgPool) -> Server<AppContext> {
    let mut app = Server::with_state(AppContext { pool });

    days::handlers::init(&mut app);
    recipes::handlers::init(&mut app);
    foods::handlers::init(&mut app);

    app
}
