import { Injectable } from '@nestjs/common'
import type { EventType, StoredBooking } from './calendar.types.js'

@Injectable()
export class CalendarStore {
  eventTypes: EventType[] = [
    {
      id: 'evt-15',
      title: 'Встреча 15 минут',
      description: 'Короткий тип события для быстрого слота.',
      durationMinutes: 15,
    },
    {
      id: 'evt-30',
      title: 'Встреча 30 минут',
      description: 'Базовый тип события для бронирования.',
      durationMinutes: 30,
    },
  ]

  bookings: StoredBooking[] = [
    {
      id: 'book-1',
      eventTypeId: 'evt-15',
      guestName: 'Иван Петров',
      guestEmail: 'ivan@example.com',
      startAt: '2026-06-04T09:00:00.000Z',
      endAt: '2026-06-04T09:15:00.000Z',
      createdAt: '2026-06-03T08:30:00.000Z',
    },
    {
      id: 'book-2',
      eventTypeId: 'evt-30',
      guestName: 'Мария Смирнова',
      guestEmail: 'maria@example.com',
      startAt: '2026-06-05T12:00:00.000Z',
      endAt: '2026-06-05T12:30:00.000Z',
      createdAt: '2026-06-03T09:10:00.000Z',
    },
  ]

  nextCustomEventTypeNumber = 1
  nextBookingNumber = 3
}
