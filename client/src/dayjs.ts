import dayjs from "dayjs"
import enGbLocale from "dayjs/locale/en-gb"
import duration from "dayjs/plugin/duration"
import localizedFormat from "dayjs/plugin/localizedFormat"
import weekday from "dayjs/plugin/weekday"

dayjs.locale(enGbLocale)
dayjs.extend(weekday)
dayjs.extend(localizedFormat)
dayjs.extend(duration)

export default dayjs
