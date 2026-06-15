export default defineNuxtConfig({
  compatibilityDate: '2026-06-03',
  srcDir: 'app',
  devtools: {
    enabled: false,
  },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
    typeCheck: true,
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '',
    },
  },
  app: {
    head: {
      title: 'Calendar',
      htmlAttrs: {
        lang: 'ru',
      },
      meta: [
        {
          name: 'description',
          content: 'Календарное бронирование встреч по API-контракту.',
        },
      ],
    },
  },
})
