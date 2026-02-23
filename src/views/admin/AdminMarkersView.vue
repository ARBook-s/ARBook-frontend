<template>
  <section aria-label="Управление маркерами">
    <a-card title="Маркеры" class="admin-card">
      <template #extra>
        <a-button type="primary" @click="formModalRef?.openCreate()"> Добавить маркер </a-button>
      </template>

      <a-spin :spinning="loadingMarkers">
        <a-empty v-if="!loadingMarkers && markers.length === 0" description="Нет маркеров" />
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
                <a-button type="link" size="small" @click="previewModalRef?.openPreviewModal(record)">
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

    <MarkerFormModal ref="formModalRef" @saved="loadMarkers" />
    <ModelPreviewModal ref="previewModalRef" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { markersApi } from '@/api/markers'
import type { Marker } from '@/api/types'
import MarkerFormModal from '@/components/MarkerFormModal.vue'
import ModelPreviewModal from '@/components/ModelPreviewModal.vue'

const loadingMarkers = ref(false)
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
  loadingMarkers.value = true
  try {
    markers.value = await markersApi.getAll()
  } catch (e) {
    message.error(e instanceof Error ? e.message : 'Ошибка загрузки маркеров')
  } finally {
    loadingMarkers.value = false
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

onMounted(async () => {
  await loadMarkers()
})
</script>

