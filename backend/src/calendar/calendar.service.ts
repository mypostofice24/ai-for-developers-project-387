import { Inject, Injectable } from '@nestjs/common'
import { bookingConflict, notFound, validationError } from './calendar.errors.js'
import { CalendarStore } from './calendar.store.js'
import type {
  Booking,
  CreateBookingRequest,
  CreateEventTypeRequest,
  EventType,
  Slot,
  StoredBooking,
} from './calendar.types.js'
import { Clock } from './clock.js'

const APP_TIME_ZONE_OFFSET_MINUTES = 300
const BOOKING_WINDOW_DAYS = 14
const WORKDAY_START_HOUR = 9
const WORKDAY_END_HOUR = 18
const MAX_DURATION_MINUTES = 540
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LocalDateParts = {
  day: number
  month: number
  year: number
}

const toIso = (date: Date) => date.toISOString()

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60_000)

const toLocalDate = (date: Date) =>
  new Date(date.getTime() + APP_TIME_ZONE_OFFSET_MINUTES * 60_000)

const getLocalDateParts = (date: Date): LocalDateParts => {
  const localDate = toLocalDate(date)

  return {
    day: localDate.getUTCDate(),
    month: localDate.getUTCMonth() + 1,
    year: localDate.getUTCFullYear(),
  }
}

const startOfLocalDayUtc = (date: Date) => {
  const parts = getLocalDateParts(date)

  return localTimeToUtc(parts, 0, 0)
}

const addLocalDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * 24 * 60 * 60_000)

const localTimeToUtc = ({ day, month, year }: LocalDateParts, hour: number, minute: number) =>
  new Date(Date.UTC(year, month - 1, day, hour, minute) - APP_TIME_ZONE_OFFSET_MINUTES * 60_000)

const parseDateTime = (value: unknown) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw validationError('Дата и время слота должны быть строкой ISO date-time.')
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw validationError('Дата и время слота должны быть корректным ISO date-time.')
  }

  return date
}

const hasIntervalOverlap = (start: Date, end: Date, booking: StoredBooking) =>
  start < new Date(booking.endAt) && end > new Date(booking.startAt)

@Injectable()
export class CalendarService {
  constructor(
    @Inject(CalendarStore) private readonly store: CalendarStore,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  listEventTypes(): EventType[] {
    return [...this.store.eventTypes]
  }

  createEventType(request: CreateEventTypeRequest): EventType {
    const title = typeof request?.title === 'string' ? request.title.trim() : ''
    const description =
      typeof request?.description === 'string' ? request.description.trim() : ''
    const durationMinutes = Number(request?.durationMinutes)

    if (!title) {
      throw validationError('Введите название типа события.')
    }

    if (!description) {
      throw validationError('Введите описание типа события.')
    }

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1 ||
      durationMinutes > MAX_DURATION_MINUTES
    ) {
      throw validationError('Длительность должна быть от 1 до 540 минут.')
    }

    const eventType: EventType = {
      id: `evt-custom-${this.store.nextCustomEventTypeNumber}`,
      title,
      description,
      durationMinutes,
    }

    this.store.nextCustomEventTypeNumber += 1
    this.store.eventTypes.push(eventType)

    return eventType
  }

  listUpcomingBookings(): Booking[] {
    const now = this.clock.now()

    return this.store.bookings
      .filter((booking) => new Date(booking.startAt) > now)
      .sort((left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime())
      .map((booking) => this.toBooking(booking))
  }

  listSlots(eventTypeId: string): Slot[] {
    const eventType = this.getEventType(eventTypeId)
    const slots: Slot[] = []
    const now = this.clock.now()
    const todayStart = startOfLocalDayUtc(now)

    for (let dayIndex = 0; dayIndex < BOOKING_WINDOW_DAYS; dayIndex += 1) {
      const localDate = getLocalDateParts(addLocalDays(todayStart, dayIndex))
      let startAt = localTimeToUtc(localDate, WORKDAY_START_HOUR, 0)
      const workdayEnd = localTimeToUtc(localDate, WORKDAY_END_HOUR, 0)

      while (addMinutes(startAt, eventType.durationMinutes) <= workdayEnd) {
        const endAt = addMinutes(startAt, eventType.durationMinutes)

        if (startAt > now && !this.hasBookingConflict(startAt, endAt)) {
          slots.push({
            eventTypeId,
            startAt: toIso(startAt),
            endAt: toIso(endAt),
            durationMinutes: eventType.durationMinutes,
          })
        }

        startAt = addMinutes(startAt, eventType.durationMinutes)
      }
    }

    return slots
  }

  createBooking(request: CreateBookingRequest): Booking {
    const eventType = this.getEventType(request?.eventTypeId)
    const guestName = typeof request?.guestName === 'string' ? request.guestName.trim() : ''
    const guestEmail = typeof request?.guestEmail === 'string' ? request.guestEmail.trim() : ''
    const startAt = parseDateTime(request?.startAt)
    const endAt = addMinutes(startAt, eventType.durationMinutes)

    if (!guestName) {
      throw validationError('Введите имя гостя.')
    }

    if (!EMAIL_PATTERN.test(guestEmail)) {
      throw validationError('Введите корректную электронную почту.')
    }

    this.assertValidSlot(eventType, startAt, endAt)

    if (this.hasBookingConflict(startAt, endAt)) {
      throw bookingConflict('Этот слот уже занят. Выберите другое время.')
    }

    const storedBooking: StoredBooking = {
      id: `book-${this.store.nextBookingNumber}`,
      eventTypeId: eventType.id,
      guestName,
      guestEmail,
      startAt: toIso(startAt),
      endAt: toIso(endAt),
      createdAt: toIso(this.clock.now()),
    }

    this.store.nextBookingNumber += 1
    this.store.bookings.push(storedBooking)

    return this.toBooking(storedBooking)
  }

  private assertValidSlot(eventType: EventType, startAt: Date, endAt: Date) {
    const now = this.clock.now()

    if (startAt <= now) {
      throw validationError('Выбранный слот уже прошел.')
    }

    const windowStart = startOfLocalDayUtc(now)
    const windowEnd = addLocalDays(windowStart, BOOKING_WINDOW_DAYS)

    if (startAt < windowStart || startAt >= windowEnd) {
      throw validationError('Выбранный слот находится вне 14-дневного окна.')
    }

    const local = toLocalDate(startAt)
    const startMinutes = local.getUTCHours() * 60 + local.getUTCMinutes()
    const workdayStartMinutes = WORKDAY_START_HOUR * 60
    const workdayEndMinutes = WORKDAY_END_HOUR * 60
    const durationFromWorkdayStart = startMinutes - workdayStartMinutes

    if (
      startMinutes < workdayStartMinutes ||
      startMinutes >= workdayEndMinutes ||
      endAt > localTimeToUtc(getLocalDateParts(startAt), WORKDAY_END_HOUR, 0)
    ) {
      throw validationError('Выбранный слот находится вне доступности 09:00-18:00.')
    }

    if (
      durationFromWorkdayStart < 0 ||
      durationFromWorkdayStart % eventType.durationMinutes !== 0
    ) {
      throw validationError('Выбранный слот не совпадает с шагом длительности типа события.')
    }
  }

  private getEventType(eventTypeId: string) {
    const eventType = this.store.eventTypes.find((candidate) => candidate.id === eventTypeId)

    if (!eventType) {
      throw notFound('Тип события не найден.')
    }

    return eventType
  }

  private hasBookingConflict(startAt: Date, endAt: Date) {
    return this.store.bookings.some((booking) => hasIntervalOverlap(startAt, endAt, booking))
  }

  private toBooking(booking: StoredBooking): Booking {
    const eventType = this.getEventType(booking.eventTypeId)

    return {
      id: booking.id,
      eventType,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      startAt: booking.startAt,
      endAt: booking.endAt,
      createdAt: booking.createdAt,
    }
  }
}
