import { beforeEach, describe, expect, it } from 'vitest'
import { CalendarService } from './calendar.service.js'
import { CalendarStore } from './calendar.store.js'
import type { Clock } from './clock.js'

const responseOf = (error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'getResponse' in error &&
    typeof error.getResponse === 'function'
  ) {
    return error.getResponse() as { code?: string }
  }

  return {}
}

describe('CalendarService', () => {
  let service: CalendarService
  let store: CalendarStore
  let clock: Clock

  beforeEach(() => {
    store = new CalendarStore()
    clock = {
      now: () => new Date('2026-06-03T11:00:00.000Z'),
    }
    service = new CalendarService(store, clock)
  })

  it('generates slots inside a 14-day window', () => {
    const slots = service.listSlots('evt-30')

    expect(slots.length).toBeGreaterThan(0)
    expect(slots.every((slot) => slot.eventTypeId === 'evt-30')).toBe(true)
    expect(slots.every((slot) => slot.durationMinutes === 30)).toBe(true)

    const firstStart = new Date(slots[0]!.startAt)
    const lastStart = new Date(slots.at(-1)!.startAt)

    expect(firstStart > clock.now()).toBe(true)
    expect(lastStart < new Date('2026-06-17T19:00:00.000Z')).toBe(true)
  })

  it('excludes occupied intervals from generated slots', () => {
    const slots = service.listSlots('evt-30')

    expect(slots.find((slot) => slot.startAt === '2026-06-05T12:00:00.000Z')).toBeUndefined()
  })

  it('returns a booking conflict for overlapping intervals', () => {
    expect(() =>
      service.createBooking({
        eventTypeId: 'evt-30',
        guestName: 'Тест',
        guestEmail: 'test@example.com',
        startAt: '2026-06-05T12:00:00.000Z',
      }),
    ).toThrow()

    try {
      service.createBooking({
        eventTypeId: 'evt-30',
        guestName: 'Тест',
        guestEmail: 'test@example.com',
        startAt: '2026-06-05T12:00:00.000Z',
      })
    } catch (error) {
      expect(responseOf(error).code).toBe('BOOKING_CONFLICT')
    }
  })

  it('returns validation error for an invalid slot', () => {
    try {
      service.createBooking({
        eventTypeId: 'evt-30',
        guestName: 'Тест',
        guestEmail: 'test@example.com',
        startAt: '2026-06-04T09:10:00.000Z',
      })
    } catch (error) {
      expect(responseOf(error).code).toBe('VALIDATION_ERROR')
    }
  })

  it('returns not found for an unknown event type', () => {
    try {
      service.listSlots('missing')
    } catch (error) {
      expect(responseOf(error).code).toBe('NOT_FOUND')
    }
  })

  it('stores created event types and generates slots for them', () => {
    const eventType = service.createEventType({
      title: 'Встреча 45 минут',
      description: 'Расширенный слот для подробного разговора.',
      durationMinutes: 45,
    })

    expect(eventType.id).toBe('evt-custom-1')
    expect(service.listEventTypes().some((item) => item.id === eventType.id)).toBe(true)
    expect(service.listSlots(eventType.id).length).toBeGreaterThan(0)
  })
})
