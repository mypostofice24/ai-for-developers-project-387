<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { today } from '@internationalized/date'
import type { Booking, Slot } from '~/types/api'

const route = useRoute()
const api = useCalendarApi()
const eventTypeId = String(route.params.id || '')

const {
  data: eventTypes,
  pending: eventTypesPending,
  error: eventTypesError,
} = await useAsyncData('booking-event-types', api.listPublicEventTypes, {
  default: () => [],
})

const {
  data: slots,
  pending: slotsPending,
  error: slotsError,
  refresh: refreshSlots,
} = await useAsyncData(`slots-${eventTypeId}`, () => api.listSlots(eventTypeId), {
  default: () => [],
})

const eventType = computed(() => eventTypes.value.find((item) => item.id === eventTypeId))
const apiError = computed(() => eventTypesError.value || slotsError.value)
const minCalendarDate = today(APP_TIME_ZONE)
const maxCalendarDate = minCalendarDate.add({ days: 13 })
const selectedDate = shallowRef<DateValue>()
const selectedSlot = ref<Slot | null>(null)
const booking = ref<Booking | null>(null)
const submitError = ref('')
const isSubmitting = ref(false)
const form = reactive({
  guestName: '',
  guestEmail: '',
})
const fieldErrors = reactive({
  guestName: '',
  guestEmail: '',
})

const slotsByDate = computed(() => {
  const result = new Map<string, Slot[]>()

  for (const slot of slots.value) {
    const key = getDateKey(slot.startAt)
    const daySlots = result.get(key) || []
    daySlots.push(slot)
    result.set(key, daySlots)
  }

  for (const daySlots of result.values()) {
    daySlots.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  }

  return result
})

const availableDateKeys = computed(() => [...slotsByDate.value.keys()].sort())
const selectedDateKey = computed(() =>
  selectedDate.value ? calendarDateToKey(selectedDate.value) : '',
)
const selectedDaySlots = computed(() =>
  selectedDateKey.value ? slotsByDate.value.get(selectedDateKey.value) || [] : [],
)

watch(
  availableDateKeys,
  (keys) => {
    const firstKey = keys[0]

    if (!selectedDate.value && firstKey) {
      selectedDate.value = calendarDateFromKey(firstKey)
    }
  },
  { immediate: true },
)

watch(selectedDateKey, () => {
  selectedSlot.value = null
  booking.value = null
  submitError.value = ''
  fieldErrors.guestName = ''
  fieldErrors.guestEmail = ''
})

watch(() => form.guestName, () => {
  fieldErrors.guestName = ''
  submitError.value = ''
})

watch(() => form.guestEmail, () => {
  fieldErrors.guestEmail = ''
  submitError.value = ''
})

const isDateDisabled = (date: DateValue) => !availableDateKeys.value.includes(calendarDateToKey(date))

const chooseSlot = (slot: Slot) => {
  selectedSlot.value = slot
  booking.value = null
  submitError.value = ''
  fieldErrors.guestName = ''
  fieldErrors.guestEmail = ''
}

const validateField = (field: 'guestName' | 'guestEmail') => {
  if (field === 'guestName') {
    fieldErrors.guestName = form.guestName.trim() ? '' : 'Введите имя.'
  } else if (field === 'guestEmail') {
    fieldErrors.guestEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)
      ? ''
      : 'Введите корректную электронную почту.'
  }
}

const validateBookingForm = (): boolean => {
  fieldErrors.guestName = form.guestName.trim() ? '' : 'Введите имя.'
  fieldErrors.guestEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)
    ? ''
    : 'Введите корректную электронную почту.'

  return !fieldErrors.guestName && !fieldErrors.guestEmail
}

const submitBooking = async () => {
  if (!selectedSlot.value) {
    return
  }

  if (!validateBookingForm()) {
    return
  }

  isSubmitting.value = true

  try {
    booking.value = await api.createBooking({
      eventTypeId,
      startAt: selectedSlot.value.startAt,
      guestName: form.guestName.trim(),
      guestEmail: form.guestEmail.trim(),
    })
    await refreshSlots()
  } catch (error) {
    submitError.value = getApiErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <NuxtLink to="/" class="muted" style="display: inline-flex; margin-bottom: 18px;">
      ← К типам событий
    </NuxtLink>

    <h1 class="section-heading" style="font-size: 30px;">
      {{ eventType?.title || 'Бронирование' }}
    </h1>

    <div v-if="eventTypesPending || slotsPending" class="booking-layout">
      <div class="booking-pane"><div class="skeleton" /></div>
      <div class="booking-pane"><div class="skeleton" /></div>
      <div class="booking-pane"><div class="skeleton" /></div>
    </div>

    <div v-else-if="apiError" class="notice error">
      {{ getApiErrorMessage(apiError) }}
      <button class="secondary-button" style="margin-top: 12px;" type="button" @click="refreshSlots()">
        Обновить слоты
      </button>
    </div>

    <div v-else-if="!eventType" class="notice error">
      Тип события не найден.
    </div>

    <section v-else class="booking-layout">
      <aside class="booking-pane">
        <div class="host-row">
          <div class="avatar">T</div>
          <div>
            <strong>Tota</strong>
            <div class="muted" style="font-size: 13px;">Host</div>
          </div>
        </div>

        <h2 style="margin: 24px 0 10px;">{{ eventType.title }}</h2>
        <p class="muted" style="margin: 0 0 18px;">{{ eventType.description }}</p>
        <div class="stack">
          <div><span class="badge">{{ eventType.durationMinutes }} мин</span></div>
          <div class="muted">Asia/Yekaterinburg</div>
        </div>

        <div class="notice" style="margin-top: 24px;">
          <div class="muted">Выбранная дата</div>
          <strong>{{ selectedDaySlots[0] ? formatShortDate(selectedDaySlots[0].startAt) : 'Дата не выбрана' }}</strong>
        </div>
      </aside>

      <section class="booking-pane">
        <h2 style="margin: 0 0 18px;">Календарь</h2>
        <div v-if="slots.length === 0" class="notice">
          Нет свободных слотов в ближайшие 14 дней.
        </div>
        <div v-else class="calendar-wrap">
          <UCalendar
            v-model="selectedDate"
            class="booking-calendar"
            color="neutral"
            locale="ru-RU"
            size="lg"
            :min-value="minCalendarDate"
            :max-value="maxCalendarDate"
            :is-date-disabled="isDateDisabled"
            :ui="{
              header: 'booking-calendar-header',
              heading: 'booking-calendar-heading',
              body: 'booking-calendar-body',
              grid: 'booking-calendar-grid',
              gridWeekDaysRow: 'booking-calendar-weekdays',
              gridRow: 'booking-calendar-row',
              headCell: 'booking-calendar-head-cell',
              cell: 'booking-calendar-cell',
              cellTrigger: 'booking-calendar-day',
            }"
          />
        </div>
      </section>

      <aside class="booking-pane">
        <h2 style="margin: 0 0 18px;">Свободное время</h2>

        <div v-if="booking" class="notice success">
          <strong>Запись создана</strong>
          <p>{{ booking.eventType.title }}</p>
          <p>{{ formatDateTime(booking.startAt) }}</p>
          <p>{{ booking.guestName }} · {{ booking.guestEmail }}</p>
          <NuxtLink to="/" class="secondary-button" style="margin-top: 8px;">
            К списку событий
          </NuxtLink>
        </div>

        <template v-else>
          <div v-if="selectedDaySlots.length === 0" class="notice">
            На выбранный день нет свободных слотов.
          </div>

          <div v-else class="slot-list">
            <button
              v-for="slot in selectedDaySlots"
              :key="slot.startAt"
              type="button"
              class="slot-button"
              :class="{ active: selectedSlot?.startAt === slot.startAt }"
              @click="chooseSlot(slot)"
            >
              <span class="status-dot" />
              {{ formatTime(slot.startAt) }}
            </button>
          </div>

          <form v-if="selectedSlot" class="form-grid" style="margin-top: 20px;" @submit.prevent="submitBooking">
            <div class="notice">
              Выбрано: <strong>{{ formatDateTime(selectedSlot.startAt) }}</strong>
            </div>
            <div class="field">
              <label for="guestName">Имя</label>
              <input
                id="guestName"
                v-model="form.guestName"
                type="text"
                autocomplete="name"
                :aria-describedby="fieldErrors.guestName ? 'guestName-error' : undefined"
                @blur="validateField('guestName')"
              >
              <p v-if="fieldErrors.guestName" id="guestName-error" class="field-error">{{ fieldErrors.guestName }}</p>
            </div>
            <div class="field">
              <label for="guestEmail">Электронная почта</label>
              <input
                id="guestEmail"
                v-model="form.guestEmail"
                type="email"
                autocomplete="email"
                :aria-describedby="fieldErrors.guestEmail ? 'guestEmail-error' : undefined"
                @blur="validateField('guestEmail')"
              >
              <p v-if="fieldErrors.guestEmail" id="guestEmail-error" class="field-error">{{ fieldErrors.guestEmail }}</p>
            </div>
            <div v-if="submitError" class="notice error">
              {{ submitError }}
              <button class="secondary-button" style="margin-top: 8px; margin-left: 0;" type="button" @click="submitBooking">
                Повторить
              </button>
            </div>
            <button class="primary-button" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Создаем...' : 'Подтвердить запись' }}
            </button>
          </form>
        </template>
      </aside>
    </section>
  </div>
</template>

<style scoped>
.field-error {
  color: #e53e3e;
  font-size: 13px;
  margin: 4px 0 0;
}
</style>
