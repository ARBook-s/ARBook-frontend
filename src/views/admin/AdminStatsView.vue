<template>
  <section aria-label="Статистика запросов к API">
    <a-card title="Статистика запросов" class="admin-card">
      <a-spin :spinning="loadingStats">
        <a-table
          :columns="statsColumns"
          :data-source="statsItems"
          :pagination="statsPagination"
          row-key="id"
          @change="handleStatsTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'createdAt'">
              {{ formatDateTime(record.createdAt) }}
            </template>
            <template v-else-if="column.key === 'ip'">
              <code>{{ record.ip }}</code>
            </template>
            <template v-else-if="column.key === 'userAgent'">
              <span class="ua">{{ record.userAgent }}</span>
            </template>
            <template v-else-if="column.key === 'action'">
              <span class="action">{{ record.action }}</span>
            </template>
          </template>
        </a-table>
      </a-spin>
    </a-card>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { StatisticsItem, StatisticsPage } from '@/api/types'
import StatisticsService from '@/api/services/statisticService'

const loadingStats = ref(false)

const statsItems = ref<StatisticsItem[]>([])
const statsPageNumber = ref(1)
const statsPageSize = ref(20)
const statsTotalCount = ref(0)

const statsColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Время', dataIndex: 'createdAt', key: 'createdAt', width: 200 },
  { title: 'IP', dataIndex: 'ip', key: 'ip', width: 160 },
  { title: 'User Agent', dataIndex: 'userAgent', key: 'userAgent' },
  { title: 'Действие', dataIndex: 'action', key: 'action' },
]

const statsPagination = computed(() => ({
  current: statsPageNumber.value,
  pageSize: statsPageSize.value,
  total: statsTotalCount.value,
  showSizeChanger: false,
}))

async function loadStats(pageNumber = statsPageNumber.value, pageSize = statsPageSize.value) {
  loadingStats.value = true
  try {
    const page: StatisticsPage = await StatisticsService.getStatistics(pageNumber, pageSize)
    statsItems.value = page.items
    statsPageNumber.value = page.pageNumber
    statsPageSize.value = page.pageSize
    statsTotalCount.value = page.totalCount
  } catch (e) {
    message.error(e instanceof Error ? e.message : 'Ошибка загрузки статистики')
  } finally {
    loadingStats.value = false
  }
}

function handleStatsTableChange(pagination: { current?: number; pageSize?: number }) {
  const page = pagination.current ?? statsPageNumber.value
  const size = pagination.pageSize ?? statsPageSize.value
  void loadStats(page, size)
}

function formatDateTime(iso: string): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('ru-RU')
  } catch {
    return iso
  }
}

onMounted(async () => {
  await loadStats()
})
</script>

