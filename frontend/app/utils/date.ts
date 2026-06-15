import { CalendarDate, type DateValue } from '@internationalized/date'

export const APP_TIME_ZONE = 'Asia/Yekaterinburg'

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  timeZone: APP_TIME_ZONE,
  weekday: 'long',
})

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: APP_TIME_ZONE,
})

export function formatDateTime(value: string) {
  const date = new Date(value)

  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`
}

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

export function formatShortDate(value: string) {
  return shortDateFormatter.format(new Date(value))
}

export function formatTime(value: string) {
  return timeFormatter.format(new Date(value))
}

export function getDateKey(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  const parts = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
  }).formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value || '0000'
  const month = parts.find((part) => part.type === 'month')?.value || '01'
  const day = parts.find((part) => part.type === 'day')?.value || '01'

  return `${year}-${month}-${day}`
}

export function calendarDateToKey(value: DateValue) {
  const month = String(value.month).padStart(2, '0')
  const day = String(value.day).padStart(2, '0')

  return `${value.year}-${month}-${day}`
}

export function calendarDateFromKey(value: string) {
  const [year = 0, month = 1, day = 1] = value.split('-').map(Number)

  return new CalendarDate(year, month, day)
}
