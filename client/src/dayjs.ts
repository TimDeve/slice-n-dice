import dayjs from "dayjs"

import duration from "dayjs/plugin/duration"
import enGbLocale from "dayjs/locale/en-gb"
import isToday from "dayjs/plugin/isToday"
import localizedFormat from "dayjs/plugin/localizedFormat"
import weekday from "dayjs/plugin/weekday"

dayjs.extend(duration)
dayjs.extend(isToday)
dayjs.extend(localizedFormat)
dayjs.extend(weekday)
dayjs.locale(enGbLocale)

export default dayjs
