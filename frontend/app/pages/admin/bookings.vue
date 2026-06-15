<script setup lang="ts">
const api = useCalendarApi()

const {
  data: bookings,
  pending,
  error,
  refresh,
} = await useAsyncData('admin-bookings', api.listAdminBookings, {
  default: () => [],
})
</script>

<template>
  <div>
    <h1 class="section-heading" style="font-size: 30px;">Админка</h1>
    <nav class="admin-tabs" aria-label="Навигация админки">
      <NuxtLink to="/admin/event-types">Типы событий</NuxtLink>
      <NuxtLink to="/admin/bookings" class="active">Бронирования</NuxtLink>
    </nav>

    <section class="panel" style="padding: 28px;">
      <h2 style="margin: 0 0 18px;">Предстоящие бронирования</h2>

      <div v-if="pending" class="stack">
        <div class="skeleton" />
        <div class="skeleton" />
      </div>

      <div v-else-if="error" class="notice error">
        {{ getApiErrorMessage(error) }}
        <button class="secondary-button" style="margin-top: 12px;" type="button" @click="refresh()">
          Повторить
        </button>
      </div>

      <div v-else-if="bookings.length === 0" class="notice">
        Предстоящих бронирований пока нет.
      </div>

      <div v-else class="admin-grid">
        <article v-for="booking in bookings" :key="booking.id" class="admin-card">
          <div class="event-card-row">
            <div>
              <h3 style="margin: 0 0 8px;">{{ booking.eventType.title }}</h3>
              <p class="muted" style="margin: 0 0 12px;">
                {{ formatDateTime(booking.startAt) }}
              </p>
              <p style="margin: 0 0 6px;">{{ booking.guestName }}</p>
              <p class="muted" style="margin: 0;">{{ booking.guestEmail }}</p>
            </div>
            <span class="badge">{{ booking.eventType.durationMinutes }} мин</span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
