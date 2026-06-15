<script setup lang="ts">
const api = useCalendarApi()

const {
  data: eventTypes,
  pending,
  error,
  refresh,
} = await useAsyncData('admin-event-types', api.listAdminEventTypes, {
  default: () => [],
})

const form = reactive({
  title: '',
  description: '',
  durationMinutes: 30,
})
const formError = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

const validateForm = () => {
  if (!form.title.trim()) {
    return 'Введите название типа события.'
  }

  if (!form.description.trim()) {
    return 'Введите описание типа события.'
  }

  if (
    !Number.isInteger(form.durationMinutes) ||
    form.durationMinutes < 1 ||
    form.durationMinutes > 540
  ) {
    return 'Длительность должна быть от 1 до 540 минут.'
  }

  return ''
}

const submit = async () => {
  formError.value = validateForm()
  successMessage.value = ''

  if (formError.value) {
    return
  }

  isSubmitting.value = true

  try {
    const createdEventType = await api.createEventType({
      title: form.title.trim(),
      description: form.description.trim(),
      durationMinutes: Number(form.durationMinutes),
    })
    successMessage.value = `Тип события «${createdEventType.title}» создан по ответу API.`
    form.title = ''
    form.description = ''
    form.durationMinutes = 30
  } catch (submitError) {
    formError.value = getApiErrorMessage(submitError)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="section-heading" style="font-size: 30px;">Админка</h1>
    <nav class="admin-tabs" aria-label="Навигация админки">
      <NuxtLink to="/admin/event-types" class="active">Типы событий</NuxtLink>
      <NuxtLink to="/admin/bookings">Бронирования</NuxtLink>
    </nav>

    <section class="admin-grid">
      <form class="admin-card form-grid" @submit.prevent="submit">
        <h2 style="margin: 0;">Создать тип события</h2>
        <div class="field">
          <label for="title">Название</label>
          <input id="title" v-model="form.title" type="text">
        </div>
        <div class="field">
          <label for="description">Описание</label>
          <textarea id="description" v-model="form.description" />
        </div>
        <div class="field">
          <label for="duration">Длительность, минут</label>
          <input id="duration" v-model.number="form.durationMinutes" type="number" min="1" max="540">
        </div>
        <div v-if="formError" class="notice error">{{ formError }}</div>
        <div v-if="successMessage" class="notice success">{{ successMessage }}</div>
        <button class="primary-button" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Создаем...' : 'Создать' }}
        </button>
      </form>

      <section class="stack">
        <div v-if="pending" class="skeleton" />
        <div v-else-if="error" class="notice error">
          {{ getApiErrorMessage(error) }}
          <button class="secondary-button" style="margin-top: 12px;" type="button" @click="refresh()">
            Повторить
          </button>
        </div>
        <div v-else-if="eventTypes.length === 0" class="notice">
          Типы событий пока не созданы.
        </div>
        <article v-for="eventType in eventTypes" v-else :key="eventType.id" class="admin-card">
          <div class="event-card-row">
            <div>
              <h3 style="margin: 0 0 8px;">{{ eventType.title }}</h3>
              <p class="muted" style="margin: 0 0 12px;">{{ eventType.description }}</p>
              <span class="muted" style="font-size: 13px;">id: {{ eventType.id }}</span>
            </div>
            <span class="badge">{{ eventType.durationMinutes }} мин</span>
          </div>
        </article>
      </section>
    </section>
  </div>
</template>
