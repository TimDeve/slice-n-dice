use std::env;

use anyhow::{Context, Result};
use async_std::task;
use sqlx::Connection;
use sqlx::{PgConnection, PgPool};
use tide::http::Url;
use uuid::Uuid;

pub struct Scaffold {
    pub pool: PgPool,
    db_url: Url,
    db_name: String,
    should_drop_db: bool,
}

impl Scaffold {
    fn should_drop_db() -> bool {
        match env::var("DONT_DROP_INTEGRATION_DB") {
            Ok(_) => false,
            _ => true,
        }
    }
    pub async fn new() -> Result<Scaffold> {
        let db_url_string =
            env::var("DATABASE_URL").context("DATABASE_URL env variable needs to be set")?;

        let mut db_url = Url::parse(&db_url_string)?;
        let id: Uuid = Uuid::new_v4();
        let mut db_name = String::from("slicendice-integration-test-");
        db_name.push_str(&id.to_string());

        db_url.set_path("/");
        let pool = PgPool::connect(&db_url.to_string()).await?;

        // Using format here because bind doesn't work for CREATE DATABASE
        sqlx::query(&format!(r#"CREATE DATABASE "{}""#, &db_name))
            .execute(&pool.clone())
            .await?;

        let mut db_path = String::from("/");
        db_path.push_str(&db_name);
        db_url.set_path(&db_path);
        let pool = PgPool::connect(&db_url.to_string()).await?;

        sqlx::migrate!().run(&pool).await?;

        Result::Ok(Scaffold {
            pool,
            db_url,
            db_name,
            should_drop_db: Self::should_drop_db(),
        })
    }

    pub async fn adrop(&mut self) -> Result<()> {
        self.pool.close().await;

        let mut db_url = self.db_url.clone();
        db_url.set_path("/");

        let mut conn = PgConnection::connect(&db_url.to_string()).await?;
        // Using format here because bind doesn't work for DROP DATABASE
        sqlx::query(&format!(r#"DROP DATABASE "{}""#, &self.db_name))
            .execute(&mut conn)
            .await?;
        Result::Ok(())
    }
}

// impl Drop for Scaffold {
//     fn drop(&mut self) {
//         if self.should_drop_db {
//             task::block_on(async {
//                 let res = self.adrop().await;
//                 match res {
//                     Ok(()) => println!("Successfully dropped test db."),
//                     Err(err) => panic!("Could not drop test db because of {}", err),
//                 }
//             })
//         } else {
//             println!(
//                 "Not dropping test db because DONT_DROP_INTEGRATION_DB is set.\n db name is '{}'",
//                 self.db_name
//             )
//         }
//     }
// }
