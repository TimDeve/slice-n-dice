use std::{error::Error, fmt::Display};

use tide::{Request, StatusCode};
use time::Date;

pub fn parse_iso_date_param<C>(req: &Request<C>, param: &str) -> Result<Date, tide::Error> {
    let iso_date_format = "%F";
    Date::parse(req.param(param)?, iso_date_format).map_err(|err| {
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
