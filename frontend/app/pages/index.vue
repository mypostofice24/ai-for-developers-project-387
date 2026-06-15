<script setup lang="ts">
const api = useCalendarApi()

const {
  data: eventTypes,
  pending,
  error,
  refresh,
} = await useAsyncData('public-event-types', api.listPublicEventTypes, {
  default: () => [],
})

const firstEventTypeLink = computed(() =>
  eventTypes.value[0] ? `/event-types/${eventTypes.value[0].id}` : '#event-types',
)
</script>

<template>
  <div>
    <section class="hero">
      <div>
        <span class="eyebrow">Быстрая запись на встречу</span>
        <h1 class="page-title" style="margin-top: 22px;">Calendar</h1>
        <p class="page-subtitle">
          Забронируйте встречу за минуту: выберите тип события, удобный день и свободное время.
        </p>
        <a :href="firstEventTypeLink" class="primary-link" style="margin-top: 28px;">
          Записаться →
        </a>
      </div>

      <aside class="hero-card">
        <h2 class="section-heading">Возможности</h2>
        <div class="stack muted">
          <p>• Выбор типа события и удобного времени для встречи.</p>
          <p>• Быстрое бронирование с подтверждением по данным API.</p>
          <p>• Управление типами встреч и просмотр предстоящих записей в админке.</p>
        </div>
      </aside>
    </section>

    <section id="event-types" class="section">
      <div class="panel" style="padding: 28px; margin-bottom: 26px;">
        <div class="host-row">
          <div class="avatar">T</div>
          <div>
            <strong>Tota</strong>
            <div class="muted" style="font-size: 13px;">Host</div>
          </div>
        </div>
        <h2 class="section-heading" style="margin-top: 22px;">Выберите тип события</h2>
        <p class="muted" style="margin: 0;">
          Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот.
        </p>
      </div>

      <div v-if="pending" class="event-grid">
        <div class="skeleton" />
        <div class="skeleton" />
      </div>

      <div v-else-if="error" class="notice error">
        {{ getApiErrorMessage(error) }}
        <button class="secondary-button" style="margin-top: 12px;" type="button" @click="refresh()">
          Повторить
        </button>
      </div>

      <div v-else-if="eventTypes.length === 0" class="notice">
        Типы событий пока не созданы.
      </div>

      <div v-else class="event-grid">
        <a
          v-for="eventType in eventTypes"
          :key="eventType.id"
          class="event-card"
          :href="`/event-types/${eventType.id}`"
        >
          <div class="event-card-row">
            <div>
              <h3 style="margin: 0 0 12px;">{{ eventType.title }}</h3>
              <p class="muted" style="margin: 0;">{{ eventType.description }}</p>
            </div>
            <span class="badge">{{ eventType.durationMinutes }} мин</span>
          </div>
          <div class="event-card-action">
            <span>Выбрать время</span>
            <span aria-hidden="true">→</span>
          </div>
        </a>
      </div>
    </section>
  </div>
</template>
