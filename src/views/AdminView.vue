<template>
  <a-layout class="admin-layout">
    <a-layout-header class="admin-header">
      <span class="admin-header__title">ARBook — Админ</span>
      <nav class="admin-header__actions" aria-label="Действия администратора">
        <a-button type="link" @click="goToAr" aria-label="Перейти к AR-книге">AR-книга</a-button>
        <a-button type="primary" ghost @click="handleLogout" aria-label="Выйти из системы"> Выйти </a-button>
      </nav>
    </a-layout-header>

    <a-layout-content class="admin-content">
      <a-card title="Маркеры" class="admin-card">
        <template #extra>
          <a-button type="primary" @click="formModalRef?.openCreate()"> Добавить маркер </a-button>
        </template>

        <a-spin :spinning="loading">
          <a-empty v-if="!loading && markers.length === 0" description="Нет маркеров" />
          <a-table
            v-else
            :columns="columns"
            :data-source="markers"
            :pagination="{ pageSize: 10 }"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                {{ record.name }}
              </template>
              <template v-else-if="column.key === 'scale'">
                {{ record.scale ?? 1 }}
              </template>
              <template v-else-if="column.key === 'actions'">
                <a-space>
                  <a-button
                    type="link"
                    size="small"
                    @click="previewModalRef?.openPreviewModal(record)"
                  >
                    Предпросмотр
                  </a-button>
                  <a-button type="link" size="small" @click="formModalRef?.openEdit(record)">
                    Редактировать
                  </a-button>
                  <a-popconfirm
                    title="Удалить маркер?"
                    ok-text="Да"
                    cancel-text="Нет"
                    @confirm="handleDelete(record.id)"
                  >
                    <a-button type="link" danger size="small">Удалить</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-spin>
      </a-card>
    </a-layout-content>

    <MarkerFormModal ref="formModalRef" @saved="loadMarkers" />
    <ModelPreviewModal ref="previewModalRef" />
  </a-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/api/store/auth'
import { markersApi } from '@/api/markers'
import type { Marker } from '@/api/types'
import MarkerFormModal from '@/components/MarkerFormModal.vue'
import ModelPreviewModal from '@/components/ModelPreviewModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const markers = ref<Marker[]>([])

const formModalRef = ref<InstanceType<typeof MarkerFormModal>>()
const previewModalRef = ref<InstanceType<typeof ModelPreviewModal>>()

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: 'Название', dataIndex: 'name', key: 'name' },
  { title: 'Масштаб', dataIndex: 'scale', key: 'scale', width: 100 },
  { title: 'Действия', key: 'actions', width: 240 },
]

async function loadMarkers() {
  loading.value = true
  try {
    markers.value = await markersApi.getAll()
  } catch (e) {
    message.error(e instanceof Error ? e.message : 'Ошибка загрузки маркеров')
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number) {
  try {
    await markersApi.delete(id)
    message.success('Маркер удалён')
    await loadMarkers()
  } catch (e) {
    message.error(e instanceof Error ? e.message : 'Ошибка удаления')
  }
}

const goToAr = () => router.push('/')
const handleLogout = async () => {
  try {
    await authStore.logout()
  } catch {
    // токен очищается в finally
  }
  await router.replace('/login')
}

onMounted(async () => {
  await loadMarkers()
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #001529;
  padding: 0 24px;
}
.admin-header__title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}
.admin-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.admin-header__actions :deep(.ant-btn-link) {
  color: rgba(255, 255, 255, 0.85);
}
.admin-header__actions :deep(.ant-btn-link:hover) {
  color: #fff;
}
.admin-content {
  padding: 24px;
  background: #f0f2f5;
}
</style>
