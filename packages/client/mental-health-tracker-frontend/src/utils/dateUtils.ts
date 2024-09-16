import { format, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export const formatDate = (dateString: string) => {
  const date = parseISO(dateString)
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const zonedDate = toZonedTime(date, timeZone)
  return format(zonedDate, "d MMMM yyyy 'at' h:mm a")
}
