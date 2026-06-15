import type { components } from '../types/api.generated.js'

export type EventType = components['schemas']['EventType']
export type Slot = components['schemas']['Slot']
export type Booking = components['schemas']['Booking']
export type CreateEventTypeRequest = components['schemas']['CreateEventTypeRequest']
export type CreateBookingRequest = components['schemas']['CreateBookingRequest']

export type StoredBooking = {
  id: string
  eventTypeId: string
  guestName: string
  guestEmail: string
  startAt: string
  endAt: string
  createdAt: string
}
