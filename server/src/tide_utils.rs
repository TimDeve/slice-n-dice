use std::{error::Error, fmt::Display};

use lazy_static::lazy_static;
use tide::{Request, StatusCode};
use time::{
    error,
    format_description::{self, FormatItem},
    Date,
};

lazy_static! {
    static ref ISO_DATE_FORMAT: Vec<FormatItem<'static>> = format_description::parse("[year repr:full]-[month padding:zero]-[day]")
        .expect("Should be able to create format_description for '[year repr:full]-[month padding:zero]-[day]'");
}

fn parse_iso_date(date: &str) -> Result<Date, error::Parse> {
    Date::parse(date, &ISO_DATE_FORMAT)
}

pub fn parse_iso_date_param<C>(req: &Request<C>, param: &str) -> Result<Date, tide::Error> {
    parse_iso_date(req.param(param)?).map_err(|err| {
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

#[cfg(test)]
mod tests {
    use time::Month;

    use super::*;

    // Mainly testing the format string is correct here.
    #[test]
    fn test_parse_iso_date() -> anyhow::Result<()> {
        let date = parse_iso_date("2022-01-30")?;
        let expected_date = Date::from_calendar_date(2022, Month::January, 30)?;
        assert_eq!(date, expected_date);
        Ok(())
    }
}
