import type { components, paths } from './api.generated'

export type EventType = components['schemas']['EventType']
export type Slot = components['schemas']['Slot']
export type Booking = components['schemas']['Booking']
export type CreateEventTypeRequest = components['schemas']['CreateEventTypeRequest']
export type CreateBookingRequest = components['schemas']['CreateBookingRequest']
export type ApiErrorResponse =
  | components['schemas']['NotFoundError']
  | components['schemas']['ValidationError']
  | components['schemas']['ConflictError']

export type PublicEventTypesResponse =
  paths['/event-types']['get']['responses']['200']['content']['application/json']
export type PublicSlotsResponse =
  paths['/event-types/{eventTypeId}/slots']['get']['responses']['200']['content']['application/json']
export type CreateBookingResponse =
  paths['/bookings']['post']['responses']['201']['content']['application/json']
export type AdminEventTypesResponse =
  paths['/admin/event-types']['get']['responses']['200']['content']['application/json']
export type CreateEventTypeResponse =
  paths['/admin/event-types']['post']['responses']['201']['content']['application/json']
export type AdminBookingsResponse =
  paths['/admin/bookings']['get']['responses']['200']['content']['application/json']
