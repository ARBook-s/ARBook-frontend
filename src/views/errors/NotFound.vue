<template>
  <main class="error-page" role="main">
    <a-result status="404" title="404" sub-title="Страница не найдена">
      <template #extra>
        <a-button type="primary" @click="goHome" aria-label="Вернуться на главную страницу">На главную</a-button>
      </template>
    </a-result>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = () => router.replace('/')
</script>
