use std::env;

use anyhow::{anyhow, Context, Result};
use async_std::task;
use serde_json::{json, Value};
use slice_n_dice_server::init_app;
use sqlx::PgPool;
use tide::{
    http::{Method, Request, Response, Url},
    StatusCode,
};
use uuid::Uuid;

struct Scaffolding {
    pool: PgPool,
    db_url: Url,
    db_name: String,
    should_drop_db: bool,
}

impl Scaffolding {
    fn should_drop_db() -> bool {
        match env::var("DONT_DROP_INTEGRATION_DB") {
            Ok(_) => false,
            _ => true,
        }
    }
    async fn new() -> Result<Scaffolding> {
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

        Result::Ok(Scaffolding {
            pool,
            db_url,
            db_name,
            should_drop_db: Self::should_drop_db(),
        })
    }

    async fn adrop(&mut self) -> Result<()> {
        self.pool.close().await;

        let mut db_url = self.db_url.clone();
        db_url.set_path("/");

        let pool = PgPool::connect(&db_url.to_string()).await?;
        // Using format here because bind doesn't work for DROP DATABASE
        sqlx::query(&format!(r#"DROP DATABASE "{}""#, &self.db_name))
            .execute(&pool)
            .await?;
        Result::Ok(())
    }
}

impl Drop for Scaffolding {
    fn drop(&mut self) {
        if self.should_drop_db {
            task::block_on(async {
                let res = self.adrop().await;
                match res {
                    Ok(()) => println!("Successfully dropped test db."),
                    Err(err) => panic!("Could not drop test db because of {}", err),
                }
            })
        } else {
            println!(
                "Not dropping test db because DONT_DROP_INTEGRATION_DB is set.\n db name is '{}'",
                self.db_name
            )
        }
    }
}

#[async_std::test]
async fn it_returns_no_recipes_when_there_is_no_recipes() -> anyhow::Result<()> {
    let scaff = Scaffolding::new().await?;

    let app = init_app(scaff.pool.clone());

    let url = Url::parse("https://localhost/api/v0/recipes").unwrap();
    let req = Request::new(Method::Get, url);
    let mut res: Response = app.respond(req).await.unwrap();

    assert_eq!(StatusCode::Ok, res.status());

    let json_body = res.body_string().await.unwrap();

    let v: Value = serde_json::from_str(&json_body)?;

    let recipes_len = v["recipes"]
        .as_array()
        .ok_or(anyhow!("'.recipes' is not an array"))?
        .len();

    assert_eq!(0, recipes_len);

    Ok(())
}

#[async_std::test]
async fn it_returns_recipes() -> anyhow::Result<()> {
    let scaff = Scaffolding::new().await?;

    sqlx::query(
        "INSERT INTO recipes ( name, quick )
         VALUES ( 'Food Stuff', true )
         RETURNING *",
    )
    .execute(&scaff.pool.clone())
    .await?;

    let app = init_app(scaff.pool.clone());

    let url = Url::parse("https://localhost/api/v0/recipes").unwrap();
    let req = Request::new(Method::Get, url);
    let mut res: Response = app.respond(req).await.unwrap();

    assert_eq!(StatusCode::Ok, res.status());

    let json_body = res.body_string().await.unwrap();

    let j: Value = serde_json::from_str(&json_body)?;

    let recipes_len = j["recipes"]
        .as_array()
        .ok_or(anyhow!("'.recipes' is not an array"))?
        .len();
    assert_eq!(1, recipes_len);

    assert_eq!("Food Stuff", j["recipes"][0]["name"]);
    assert_eq!(true, j["recipes"][0]["quick"]);

    let id_is_present = match j["recipes"][0]["id"] {
        Value::String(_) => true,
        _ => false,
    };
    assert_eq!(true, id_is_present);

    Ok(())
}
