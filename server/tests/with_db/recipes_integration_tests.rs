use anyhow::{anyhow, bail, Context, Result};
use async_std::task;
use serde_json::Value;
use slice_n_dice_server::init_app;
use tide::{
    http::{Method, Request, Response, Url},
    StatusCode,
};

use super::integration_scaffold::Scaffold;
use uuid::Uuid;

fn api_url(sub_url: &str) -> Url {
    let mut url_string = String::from("https://localhost/api/v0");
    url_string.push_str(sub_url);
    Url::parse(&url_string).expect("Could not create url")
}

fn assert_json_is_uuid(v: &Value) -> Result<()> {
    match v {
        Value::String(s) => Uuid::parse_str(s)
            .map(|_| ())
            .context("Could not parse the json string into a UUID"),
        _ => bail!("Json value should be a string to be a UUID"),
    }
}

// #[async_std::test]
// async fn it_returns_no_recipes_when_there_is_no_recipes() -> Result<()> {
//     let scaff = Scaffold::new().await?;
//
//     let app = init_app(scaff.pool.clone());
//
//     let req = Request::new(Method::Get, api_url("/recipes"));
//     let mut res: Response = app.respond(req).await.unwrap();
//
//     assert_eq!(StatusCode::Ok, res.status());
//
//     let json_body = res.body_string().await.unwrap();
//
//     let v: Value = serde_json::from_str(&json_body)?;
//
//     let recipes_len = v["recipes"]
//         .as_array()
//         .ok_or(anyhow!("'.recipes' is not an array"))?
//         .len();
//
//     assert_eq!(0, recipes_len);
//
//     Ok(())
// }

#[async_std::test]
async fn it_returns_recipes_no_block() -> Result<()> {
    let mut scaff = Scaffold::new().await?;

    {
        sqlx::query(
            "INSERT INTO recipes ( name, quick )
         VALUES ( 'Food Stuff', true )",
        )
        .execute(&scaff.pool.clone())
        .await?;

        let app = init_app(scaff.pool.clone());

        let req = Request::new(Method::Get, api_url("/recipes"));
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

        assert_json_is_uuid(&j["recipes"][0]["id"])?;
    }

    scaff.adrop().await?;

    Ok(())
}

// #[test]
// fn it_returns_recipes_block_on() -> Result<()> {
//     task::block_on(async {
//         let mut scaff = Scaffold::new().await?;
//
//         sqlx::query(
//             "INSERT INTO recipes ( name, quick )
//          VALUES ( 'Food Stuff', true )",
//         )
//         .execute(&scaff.pool.clone())
//         .await?;
//
//         let app = init_app(scaff.pool.clone());
//
//         let req = Request::new(Method::Get, api_url("/recipes"));
//         let mut res: Response = app.respond(req).await.unwrap();
//
//         assert_eq!(StatusCode::Ok, res.status());
//
//         let json_body = res.body_string().await.unwrap();
//
//         let j: Value = serde_json::from_str(&json_body)?;
//
//         let recipes_len = j["recipes"]
//             .as_array()
//             .ok_or(anyhow!("'.recipes' is not an array"))?
//             .len();
//         assert_eq!(1, recipes_len);
//
//         assert_eq!("Food Stuff", j["recipes"][0]["name"]);
//         assert_eq!(true, j["recipes"][0]["quick"]);
//
//         assert_json_is_uuid(&j["recipes"][0]["id"])?;
//
//         scaff.adrop().await?;
//
//         Ok::<(), anyhow::Error>(())
//     })
// }
