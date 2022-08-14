use std::{error::Error, fmt::Display};

use lazy_static::lazy_static;
use tide::{Request, StatusCode};
use time::{
    format_description::{self, FormatItem},
    Date,
};

lazy_static! {
    static ref ISO_DATE_FORMAT: Vec<FormatItem<'static>> = format_description::parse("[year repr:full]-[month padding:zero]-[day]")
        .expect("Should be able to create format_description for '[year repr:full]-[month padding:zero]-[day]'");
}

pub fn parse_iso_date_param<C>(req: &Request<C>, param: &str) -> Result<Date, tide::Error> {
    Date::parse(req.param(param)?, &ISO_DATE_FORMAT).map_err(|err| {
        tide::Error::new(
            StatusCode::BadRequest,
            anyhow::Error::new(err).context(format!("Failed to parse url param '{}'", param)),
        )
    })
}

pub fn parse_param<T, C>(req: &Request<C>, param: &str) -> Result<T, tide::Error>
where
    T: std::str::FromStr,
    <T as std::str::FromStr>::Err: Display + Sync + Send + Error + 'static,
{
    req.param(param)?.parse().map_err(|err| {
        tide::Error::new(
            StatusCode::BadRequest,
            anyhow::Error::new(err).context(format!("Failed to parse url param '{}'", param)),
        )
    })
}
