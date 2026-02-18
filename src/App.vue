<script setup lang="ts">
import ErrorBoundary from '@/components/ErrorBoundary.vue'
</script>

<template>
  <ErrorBoundary>
    <router-view />
  </ErrorBoundary>
  <noscript>
    <p style="text-align: center; padding: 2rem; font-family: sans-serif;">
      Для работы ARBook необходим JavaScript. Пожалуйста, включите его в настройках браузера.
    </p>
  </noscript>
</template>

<style>
#app {
  min-height: 100vh;
}
</style>
