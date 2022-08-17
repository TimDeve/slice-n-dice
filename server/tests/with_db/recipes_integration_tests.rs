use anyhow::{anyhow, bail, Context, Result};
use serde_json::{json, Value};
use slice_n_dice_server::init_app;
use sqlx::PgPool;
use tide::{
    http::{Method, Request, Response, Url},
    StatusCode,
};
use uuid::Uuid;

#[sqlx::test]
async fn it_returns_no_recipes_when_there_is_no_recipes(pool: PgPool) -> Result<()> {
    let app = init_app(pool);

    let req = Request::new(Method::Get, api_url("/recipes"));
    let mut res: Response = emap(app.respond(req).await)?;

    assert_eq!(StatusCode::Ok, res.status());

    let json_body = emap(res.body_string().await)?;

    let v: Value = serde_json::from_str(&json_body)?;

    let recipes_len = v["recipes"]
        .as_array()
        .ok_or(anyhow!("'.recipes' is not an array"))?
        .len();

    assert_eq!(0, recipes_len);

    Ok(())
}

#[sqlx::test]
async fn it_returns_recipes(pool: PgPool) -> Result<()> {
    let app = init_app(pool);

    let recipe_body = empty_json_recipe_body();

    // Create recipe
    let mut req = Request::new(Method::Post, api_url("/recipes"));
    req.set_body(json!({"name": "Food Stuff", "quick": true, "body": recipe_body}));
    let res: Response = emap(app.respond(req).await)?;
    assert_eq!(StatusCode::Created, res.status());

    // Retrieve recipes
    let req = Request::new(Method::Get, api_url("/recipes"));
    let mut res: Response = emap(app.respond(req).await)?;
    assert_eq!(StatusCode::Ok, res.status());

    let res_body = emap(res.body_string().await)?;
    let res_body: Value = serde_json::from_str(&res_body)?;

    let recipes_len = res_body["recipes"]
        .as_array()
        .ok_or(anyhow!("'.recipes' is not an array"))?
        .len();
    assert_eq!(1, recipes_len);

    assert_eq!("Food Stuff", res_body["recipes"][0]["name"]);
    assert_eq!(true, res_body["recipes"][0]["quick"]);

    assert_json_is_uuid(&res_body["recipes"][0]["id"])?;

    Ok(())
}

#[sqlx::test]
async fn it_creates_and_retrieves_a_recipe(pool: PgPool) -> Result<()> {
    let app = init_app(pool);

    let mut recipe_body = empty_json_recipe_body();
    recipe_body["blocks"] = json!([recipe_body_block("What a recipe!")]);
    let req_body = json!({"name": "Food Stuff", "quick": true, "body": recipe_body});

    // Create recipe
    let mut req = Request::new(Method::Post, api_url("/recipes"));
    req.set_body(req_body.clone());
    let mut res: Response = emap(app.respond(req).await)?;
    assert_eq!(StatusCode::Created, res.status());

    let res_body = emap(res.body_string().await)?;
    let res_body: Value = serde_json::from_str(&res_body)?;
    let uuid = res_body["id"]
        .as_str()
        .context("Should have id field that is a string")?;

    assert_eq!(req_body["name"], res_body["name"]);
    assert_eq!(req_body["body"], res_body["body"]);
    assert_eq!(req_body["quick"], res_body["quick"]);
    assert_json_is_uuid(&res_body["id"])?;

    // Retrieve recipe
    let req = Request::new(Method::Get, api_url(&format!("/recipes/{}", uuid)));
    let mut res: Response = emap(app.respond(req).await)?;
    assert_eq!(StatusCode::Ok, res.status());

    let res_body = emap(res.body_string().await)?;
    let res_body: Value = serde_json::from_str(&res_body)?;

    assert_eq!(req_body["name"], res_body["name"]);
    assert_eq!(req_body["body"], res_body["body"]);
    assert_eq!(req_body["quick"], res_body["quick"]);
    assert_eq!(uuid, res_body["id"]);

    Ok(())
}

fn emap<T>(res: Result<T, tide::Error>) -> Result<T, anyhow::Error> {
    res.map_err(tide::Error::into_inner)
}

fn recipe_body_block(text: &str) -> Value {
    let key = &Uuid::new_v4().to_string()[0..5];
    json!({
      "key": key,
      "text": text,
      "type": "unstyled",
      "depth": 0,
      "inlineStyleRanges": [],
      "entityRanges": [],
      "data": {}
    })
}

fn empty_json_recipe_body() -> Value {
    json!({"blocks":[],"entityMap":{}})
}

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
