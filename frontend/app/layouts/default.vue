<script setup lang="ts">
const route = useRoute()

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/' || route.path.startsWith('/event-types/')
  }

  return route.path.startsWith(path)
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <NuxtLink to="/" class="brand" aria-label="Calendar">
        <span class="brand-mark">▣</span>
        <span>Calendar</span>
      </NuxtLink>

      <nav class="topnav" aria-label="Главная навигация">
        <NuxtLink to="/" class="nav-link" :class="{ active: isActive('/') }">
          Записаться
        </NuxtLink>
        <NuxtLink to="/admin/event-types" class="nav-link" :class="{ active: isActive('/admin') }">
          Админка
        </NuxtLink>
      </nav>
    </header>

    <main class="page-frame">
      <slot />
    </main>
  </div>
</template>
