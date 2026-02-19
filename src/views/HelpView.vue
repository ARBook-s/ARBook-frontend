<template>
  <main class="help" role="main">
    <header class="help__header">
      <router-link :to="backTo" class="help__back" :aria-label="backLabel">&larr; {{ backText }}</router-link>
      <h1 class="help__page-title">{{ pageTitle }}</h1>
    </header>

    <div class="help__content">
      <router-view />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isIndex = computed(() => route.name === 'help')

const backTo = computed(() => (isIndex.value ? '/' : '/help'))
const backText = computed(() => (isIndex.value ? 'Назад' : 'Справка'))
const backLabel = computed(() =>
  isIndex.value ? 'Вернуться на главную' : 'Вернуться к разделам справки',
)
const pageTitle = computed(() => {
  const title = route.meta?.title
  return typeof title === 'string' ? title : 'Как пользоваться'
})
</script>

<style scoped>
.help {
  min-height: 100vh;
  background: linear-gradient(160deg, #f8f4ee 0%, #ebe6dc 100%);
  color: #2c3539;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  padding: 0 0 3rem;
}

.help__header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(248, 244, 238, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(44, 53, 57, 0.06);
}

.help__back {
  color: #0d5c63;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: opacity 0.15s;
}

.help__back:hover {
  opacity: 0.7;
}

.help__page-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: #1a2226;
}

.help__content {
  max-width: 36rem;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

@supports (padding: env(safe-area-inset-left)) {
  .help__header {
    padding-left: max(1.5rem, env(safe-area-inset-left));
    padding-right: max(1.5rem, env(safe-area-inset-right));
    padding-top: max(1rem, env(safe-area-inset-top));
  }

  .help__content {
    padding-left: max(1.5rem, env(safe-area-inset-left));
    padding-right: max(1.5rem, env(safe-area-inset-right));
  }
}
</style>
