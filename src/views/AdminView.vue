<template>
  <a-layout class="admin-layout">
    <a-layout-header class="admin-header">
      <span class="admin-header__title">ARBook — Админ</span>
      <div class="admin-header__actions">
        <a-button type="link" @click="goToAr">AR-книга</a-button>
        <a-button type="primary" ghost @click="handleLogout">
          Выйти
        </a-button>
      </div>
    </a-layout-header>
    <a-layout-content class="admin-content">
      <a-card title="Маркеры" class="admin-card">
        <template #extra>
          <a-button type="primary" @click="openCreateModal">
            Добавить маркер
          </a-button>
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
                  <a-button type="link" size="small" @click="openPreviewModal(record)">
                    Предпросмотр
                  </a-button>
                  <a-button type="link" size="small" @click="openEditModal(record)">
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

    <!-- Модалка создания/редактирования -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingMarker ? 'Редактировать маркер' : 'Новый маркер'"
      :confirm-loading="submitting"
      ok-text="Сохранить"
      cancel-text="Отмена"
      width="480px"
      :destroy-on-close="true"
      @ok="handleSubmit"
    >
      <a-form
        ref="formRef"
        :model="formState"
        layout="vertical"
        :rules="formRules"
      >
        <a-form-item label="Название" name="name">
          <a-input v-model:value="formState.name" placeholder="Название маркера" />
        </a-form-item>
        <a-form-item label="Масштаб" name="scale">
          <a-input-number
            v-model:value="formState.scale"
            :min="0.1"
            :max="10"
            :step="0.1"
            style="width: 100%"
          />
        </a-form-item>

        <template v-if="!editingMarker">
          <a-form-item label="Файл разметки (.mind)" name="mindFileList" :rules="formRules.mindFileList">
            <a-upload
              v-model:file-list="formState.mindFileList"
              :max-count="1"
              :before-upload="() => false"
              accept=".mind"
            >
              <a-button>Выбрать файл</a-button>
            </a-upload>
          </a-form-item>
          <a-form-item label="3D-модель (GLB)" name="glbFileList" :rules="formRules.glbFileList">
            <a-upload
              v-model:file-list="formState.glbFileList"
              :max-count="1"
              :before-upload="() => false"
              accept=".glb"
            >
              <a-button>Выбрать файл</a-button>
            </a-upload>
          </a-form-item>
          <a-form-item label="Аудио" name="audioFileList" :rules="formRules.audioFileList">
            <a-upload
              v-model:file-list="formState.audioFileList"
              :max-count="1"
              :before-upload="() => false"
              accept=".mp3,.wav,.ogg,.m4a"
            >
              <a-button>Выбрать файл</a-button>
            </a-upload>
          </a-form-item>
        </template>

        <template v-else>
          <a-divider>Заменить файлы (оставьте пустым, чтобы не менять)</a-divider>
          <a-form-item label="Файл разметки (.mind)" name="mindFileList">
            <a-upload
              v-model:file-list="formState.mindFileList"
              :max-count="1"
              :before-upload="() => false"
              accept=".mind"
            >
              <a-button>Выбрать новый файл</a-button>
            </a-upload>
          </a-form-item>
          <a-form-item label="3D-модель (GLB)" name="glbFileList">
            <a-upload
              v-model:file-list="formState.glbFileList"
              :max-count="1"
              :before-upload="() => false"
              accept=".glb"
            >
              <a-button>Выбрать новый файл</a-button>
            </a-upload>
          </a-form-item>
          <a-form-item label="Аудио" name="audioFileList">
            <a-upload
              v-model:file-list="formState.audioFileList"
              :max-count="1"
              :before-upload="() => false"
              accept=".mp3,.wav,.ogg,.m4a"
            >
              <a-button>Выбрать новый файл</a-button>
            </a-upload>
          </a-form-item>
        </template>
      </a-form>
    </a-modal>

    <!-- Модалка предпросмотра -->
    <a-modal
      v-model:open="previewModalVisible"
      title="Предпросмотр маркера"
      :footer="null"
      width="560px"
      :destroy-on-close="true"
    >
      <div v-if="previewingMarker" class="preview-modal">
        <div class="preview-modal__canvas" ref="previewCanvasRef"></div>
        <div v-if="previewingMarker.audioPath" class="preview-modal__audio">
          <span class="preview-modal__label">Аудио:</span>
          <audio
            :src="getAssetUrl(previewingMarker.audioPath)"
            controls
            preload="metadata"
          />
        </div>
        <div v-else class="preview-modal__no-audio">Аудио не загружено</div>
      </div>
    </a-modal>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useAuthStore } from '@/api/store/auth'
import { markersApi, getAssetUrl } from '@/api/markers'
import type { Marker } from '@/api/types'
import type { FormInstance } from 'ant-design-vue'
import type { UploadFile } from 'ant-design-vue/es/upload/interface'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const markers = ref<Marker[]>([])
const modalVisible = ref(false)
const previewModalVisible = ref(false)
const previewingMarker = ref<Marker | null>(null)
const previewCanvasRef = ref<HTMLDivElement | null>(null)
const submitting = ref(false)

let previewRenderer: THREE.WebGLRenderer | null = null
let previewControls: InstanceType<typeof OrbitControls> | null = null
let previewAnimationId: number | null = null
const formRef = ref<FormInstance>()
const editingMarker = ref<Marker | null>(null)

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: 'Название', dataIndex: 'name', key: 'name' },
  { title: 'Масштаб', dataIndex: 'scale', key: 'scale', width: 100 },
  { title: 'Действия', key: 'actions', width: 240 },
]

const formState = reactive({
  name: '',
  scale: 1,
  mindFileList: [] as UploadFile[],
  glbFileList: [] as UploadFile[],
  audioFileList: [] as UploadFile[],
})

function getFileFromUploadItem(item: UploadFile | undefined): File | undefined {
  if (!item) return undefined
  const file = item.originFileObj ?? item
  return file instanceof File ? file : undefined
}

const formRules = reactive({
  name: [{ required: true, message: 'Введите название' }],
  scale: [{ required: true, message: 'Укажите масштаб' }],
  mindFileList: [{
    validator(_rule: unknown, v: UploadFile[]) {
      if (editingMarker.value) return Promise.resolve()
      const file = getFileFromUploadItem(v?.[0])
      return file ? Promise.resolve() : Promise.reject(new Error('Выберите файл разметки (.mind)'))
    },
  }],
  glbFileList: [{
    validator(_rule: unknown, v: UploadFile[]) {
      if (editingMarker.value) return Promise.resolve()
      const file = getFileFromUploadItem(v?.[0])
      return file ? Promise.resolve() : Promise.reject(new Error('Выберите 3D-модель (GLB)'))
    },
  }],
  audioFileList: [{
    validator(_rule: unknown, v: UploadFile[]) {
      if (editingMarker.value) return Promise.resolve()
      const file = getFileFromUploadItem(v?.[0])
      return file ? Promise.resolve() : Promise.reject(new Error('Выберите аудиофайл'))
    },
  }],
})

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

function resetForm() {
  formState.name = ''
  formState.scale = 1
  formState.mindFileList = []
  formState.glbFileList = []
  formState.audioFileList = []
  editingMarker.value = null
}

function openCreateModal() {
  resetForm()
  modalVisible.value = true
}

function openPreviewModal(record: Marker) {
  previewingMarker.value = record
  previewModalVisible.value = true
}

async function initPreview() {
  const marker = previewingMarker.value
  const container = previewCanvasRef.value
  if (!marker?.glbModelPath || !container) return

  const { width, height } = container.getBoundingClientRect()
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f2f5)
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(2, 2, 2)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  scene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 1))
  scene.add(new THREE.DirectionalLight(0xffffff, 0.5))

  try {
    const loader = new GLTFLoader()
    const baseUrl = getAssetUrl(marker.glbModelPath)
    const glbUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`
    const gltf = await loader.loadAsync(glbUrl)
    const model = gltf.scene as THREE.Group
    const baseScale = 0.3
    model.scale.setScalar(baseScale * (marker.scale ?? 1))
    scene.add(model)
  } catch (e) {
    message.error(e instanceof Error ? e.message : 'Ошибка загрузки 3D-модели')
  }

  const animate = () => {
    previewAnimationId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  previewRenderer = renderer
  previewControls = controls
}

function disposePreview() {
  if (previewAnimationId !== null) {
    cancelAnimationFrame(previewAnimationId)
    previewAnimationId = null
  }
  previewControls?.dispose()
  previewControls = null
  if (previewRenderer) {
    previewRenderer.domElement.parentNode?.removeChild(previewRenderer.domElement)
    previewRenderer.dispose()
    previewRenderer = null
  }
  previewingMarker.value = null
}

watch(previewModalVisible, async (visible) => {
  if (visible) {
    await nextTick()
    setTimeout(initPreview, 50)
  } else {
    disposePreview()
  }
})

function openEditModal(record: Marker) {
  editingMarker.value = record
  formState.name = record.name
  formState.scale = record.scale ?? 1
  formState.mindFileList = []
  formState.glbFileList = []
  formState.audioFileList = []
  modalVisible.value = true
}

function buildFormData(): FormData {
  const fd = new FormData()
  fd.append('name', formState.name)
  fd.append('scale', String(formState.scale))

  const mindFile = getFileFromUploadItem(formState.mindFileList[0])
  if (mindFile) fd.append('mind', mindFile)

  const glbFile = getFileFromUploadItem(formState.glbFileList[0])
  if (glbFile) fd.append('glb', glbFile)

  const audioFile = getFileFromUploadItem(formState.audioFileList[0])
  if (audioFile) fd.append('audio', audioFile)

  return fd
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const isCreate = !editingMarker.value
  if (isCreate) {
    const mindFile = getFileFromUploadItem(formState.mindFileList[0])
    const glbFile = getFileFromUploadItem(formState.glbFileList[0])
    const audioFile = getFileFromUploadItem(formState.audioFileList[0])
    if (!mindFile || !glbFile || !audioFile) {
      message.error('Заполните все поля: разметка (.mind), 3D-модель (GLB), аудио')
      return
    }
  }

  submitting.value = true
  try {
    const fd = buildFormData()
    if (isCreate) {
      await markersApi.create(fd)
    } else {
      await markersApi.update(editingMarker.value!.id, fd)
    }
    modalVisible.value = false
    message.success(isCreate ? 'Маркер создан' : 'Маркер обновлён')
    await loadMarkers()
  } catch (e) {
    message.error(e instanceof Error ? e.message : 'Ошибка сохранения')
  } finally {
    submitting.value = false
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

onMounted(async() => {
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

.preview-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.preview-modal__canvas {
  width: 100%;
  height: 320px;
  background: #f0f2f5;
  border-radius: 8px;
  overflow: hidden;
}
.preview-modal__canvas canvas {
  display: block;
}
.preview-modal__audio {
  display: flex;
  align-items: center;
  gap: 12px;
}
.preview-modal__label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);
}
.preview-modal__audio audio {
  flex: 1;
  max-width: 100%;
}
.preview-modal__no-audio {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}
</style>
