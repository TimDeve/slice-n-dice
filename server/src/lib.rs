mod days;
mod domain;
mod foods;
mod recipes;
mod serde_date;
mod tide_utils;

use sqlx::postgres::PgPool;
use tide::Server;

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
