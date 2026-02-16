<template>
  <div class="error-page">
    <a-result status="404" title="404" sub-title="Страница не найдена">
      <template #extra>
        <a-button type="primary" @click="goHome">На главную</a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = () => router.replace('/')
</script>
