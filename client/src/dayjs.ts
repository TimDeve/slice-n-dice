import dayjs from "dayjs"
import enGbLocale from "dayjs/locale/en-gb"
import duration from "dayjs/plugin/duration"
import isToday from "dayjs/plugin/isToday"
import localizedFormat from "dayjs/plugin/localizedFormat"
import weekday from "dayjs/plugin/weekday"

export function setupDayjs() {
  dayjs.extend(duration)
  dayjs.extend(isToday)
  dayjs.extend(localizedFormat)
  dayjs.extend(weekday)
  dayjs.locale(enGbLocale)
}
