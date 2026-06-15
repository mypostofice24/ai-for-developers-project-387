import type {
  AdminBookingsResponse,
  AdminEventTypesResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  CreateEventTypeRequest,
  CreateEventTypeResponse,
  PublicEventTypesResponse,
  PublicSlotsResponse,
} from '~/types/api'

type FetchErrorLike = {
  status?: number
  statusCode?: number
  data?: {
    code?: string
    message?: string
  }
}

export function getApiStatus(error: unknown) {
  const candidate = error as FetchErrorLike

  return candidate?.statusCode || candidate?.status
}

export function getApiErrorMessage(error: unknown) {
  const status = getApiStatus(error)

  if (status === 404) {
    return 'Тип события не найден.'
  }

  if (status === 409) {
    return 'Этот слот уже занят. Выберите другое время.'
  }

  if (status === 422) {
    return 'Выбранное время недоступно. Обновите слоты и попробуйте снова.'
  }

  const candidate = error as FetchErrorLike

  return candidate?.data?.message || 'Не удалось загрузить данные. Попробуйте позже.'
}

export function useCalendarApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  const apiFetch = $fetch.create({
    baseURL,
  })

  return {
    listPublicEventTypes: () => apiFetch<PublicEventTypesResponse>('/event-types'),
    listSlots: (eventTypeId: string) =>
      apiFetch<PublicSlotsResponse>(`/event-types/${encodeURIComponent(eventTypeId)}/slots`),
    createBooking: (request: CreateBookingRequest) =>
      apiFetch<CreateBookingResponse>('/bookings', {
        method: 'POST',
        body: request,
      }),
    listAdminEventTypes: () => apiFetch<AdminEventTypesResponse>('/admin/event-types'),
    createEventType: (request: CreateEventTypeRequest) =>
      apiFetch<CreateEventTypeResponse>('/admin/event-types', {
        method: 'POST',
        body: request,
      }),
    listAdminBookings: () => apiFetch<AdminBookingsResponse>('/admin/bookings'),
  }
}
