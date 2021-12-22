use serde::{Deserialize, Deserializer, Serializer};
use time::Date;

const ISO_FORMAT: &'static str = "%F"; // "2020-01-30"

pub fn serialize<S>(date: &Date, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let s = date.format(ISO_FORMAT);
    serializer.serialize_str(&s)
}

pub fn deserialize<'de, D>(deserializer: D) -> Result<Date, D::Error>
where
    D: Deserializer<'de>,
{
    let s = String::deserialize(deserializer)?;
    Date::parse(&s, ISO_FORMAT).map_err(serde::de::Error::custom)
}
