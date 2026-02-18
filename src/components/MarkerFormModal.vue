<template>
  <a-modal
    v-model:open="visible"
    :title="editingMarker ? 'Редактировать маркер' : 'Новый маркер'"
    :confirm-loading="submitting"
    ok-text="Сохранить"
    cancel-text="Отмена"
    width="480px"
    :destroy-on-close="true"
    @ok="handleSubmit"
  >
    <a-form ref="formRef" :model="formState" layout="vertical" :rules="formRules">
      <a-form-item label="Название" name="name">
        <a-input v-model:value="formState.name" placeholder="Название маркера" />
      </a-form-item>
      <a-form-item label="Масштаб" name="scale">
        <a-input-number
          v-model:value="formState.scale"
          :min="0.1"
          :max="10"
          :step="0.1"
          class="full-width"
        />
      </a-form-item>

      <template v-if="!editingMarker">
        <a-form-item
          label="Файл разметки (.mind)"
          name="mindFileList"
          :rules="formRules.mindFileList"
        >
          <a-upload-dragger
            v-model:file-list="formState.mindFileList"
            :max-count="1"
            :before-upload="() => false"
            accept=".mind"
            class="compact-dragger"
          >
            <p class="ant-upload-drag-icon"><inbox-outlined /></p>
            <p class="ant-upload-text">Нажмите или перетащите .mind файл</p>
          </a-upload-dragger>
        </a-form-item>
        <a-form-item label="3D-модель (GLB)" name="glbFileList" :rules="formRules.glbFileList">
          <a-upload-dragger
            v-model:file-list="formState.glbFileList"
            :max-count="1"
            :before-upload="() => false"
            accept=".glb"
            class="compact-dragger"
          >
            <p class="ant-upload-drag-icon"><inbox-outlined /></p>
            <p class="ant-upload-text">Нажмите или перетащите .glb файл</p>
          </a-upload-dragger>
        </a-form-item>
        <a-form-item label="Аудио" name="audioFileList" :rules="formRules.audioFileList">
          <a-upload-dragger
            v-model:file-list="formState.audioFileList"
            :max-count="1"
            :before-upload="() => false"
            accept=".mp3,.wav,.ogg,.m4a"
            class="compact-dragger"
          >
            <p class="ant-upload-drag-icon"><inbox-outlined /></p>
            <p class="ant-upload-text">Нажмите или перетащите аудио</p>
          </a-upload-dragger>
        </a-form-item>
      </template>

      <template v-else>
        <a-divider>Заменить файлы (оставьте пустым, чтобы не менять)</a-divider>
        <a-form-item label="Файл разметки (.mind)" name="mindFileList">
          <a-upload-dragger
            v-model:file-list="formState.mindFileList"
            :max-count="1"
            :before-upload="() => false"
            accept=".mind"
            class="compact-dragger"
          >
            <p class="ant-upload-drag-icon"><inbox-outlined /></p>
            <p class="ant-upload-text">Нажмите или перетащите новый .mind файл</p>
          </a-upload-dragger>
        </a-form-item>
        <a-form-item label="3D-модель (GLB)" name="glbFileList">
          <a-upload-dragger
            v-model:file-list="formState.glbFileList"
            :max-count="1"
            :before-upload="() => false"
            accept=".glb"
            class="compact-dragger"
          >
            <p class="ant-upload-drag-icon"><inbox-outlined /></p>
            <p class="ant-upload-text">Нажмите или перетащите новый .glb файл</p>
          </a-upload-dragger>
        </a-form-item>
        <a-form-item label="Аудио" name="audioFileList">
          <a-upload-dragger
            v-model:file-list="formState.audioFileList"
            :max-count="1"
            :before-upload="() => false"
            accept=".mp3,.wav,.ogg,.m4a"
            class="compact-dragger"
          >
            <p class="ant-upload-drag-icon"><inbox-outlined /></p>
            <p class="ant-upload-text">Нажмите или перетащите новое аудио</p>
          </a-upload-dragger>
        </a-form-item>
      </template>

      <a-progress
        v-if="submitting && uploadProgress > 0"
        :percent="uploadProgress"
        :status="uploadProgress === 100 ? 'success' : 'active'"
        size="small"
        class="upload-progress"
      />
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import { markersApi } from '@/api/markers'
import type { Marker } from '@/api/types'
import type { FormInstance } from 'ant-design-vue'
import type { UploadFile } from 'ant-design-vue/es/upload/interface'

const emit = defineEmits<{ saved: [] }>()

const visible = ref(false)
const submitting = ref(false)
const uploadProgress = ref(0)
const formRef = ref<FormInstance>()
const editingMarker = ref<Marker | null>(null)

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
  mindFileList: [
    {
      validator(_rule: unknown, v: UploadFile[]) {
        if (editingMarker.value) return Promise.resolve()
        const file = getFileFromUploadItem(v?.[0])
        return file
          ? Promise.resolve()
          : Promise.reject(new Error('Выберите файл разметки (.mind)'))
      },
    },
  ],
  glbFileList: [
    {
      validator(_rule: unknown, v: UploadFile[]) {
        if (editingMarker.value) return Promise.resolve()
        const file = getFileFromUploadItem(v?.[0])
        return file ? Promise.resolve() : Promise.reject(new Error('Выберите 3D-модель (GLB)'))
      },
    },
  ],
  audioFileList: [
    {
      validator(_rule: unknown, v: UploadFile[]) {
        if (editingMarker.value) return Promise.resolve()
        const file = getFileFromUploadItem(v?.[0])
        return file ? Promise.resolve() : Promise.reject(new Error('Выберите аудиофайл'))
      },
    },
  ],
})

function resetForm() {
  formState.name = ''
  formState.scale = 1
  formState.mindFileList = []
  formState.glbFileList = []
  formState.audioFileList = []
  editingMarker.value = null
}

function openCreate() {
  resetForm()
  visible.value = true
}

function openEdit(record: Marker) {
  editingMarker.value = record
  formState.name = record.name
  formState.scale = record.scale ?? 1
  formState.mindFileList = []
  formState.glbFileList = []
  formState.audioFileList = []
  visible.value = true
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
  uploadProgress.value = 0
  try {
    const fd = buildFormData()
    const onUploadProgress = (event: { loaded: number; total?: number }) => {
      if (event.total) {
        uploadProgress.value = Math.round((event.loaded / event.total) * 100)
      }
    }
    if (isCreate) {
      await markersApi.create(fd, { onUploadProgress })
    } else {
      await markersApi.update(editingMarker.value!.id, fd, { onUploadProgress })
    }
    visible.value = false
    message.success(isCreate ? 'Маркер создан' : 'Маркер обновлён')
    emit('saved')
  } catch (e) {
    message.error(e instanceof Error ? e.message : 'Ошибка сохранения')
  } finally {
    submitting.value = false
    uploadProgress.value = 0
  }
}

defineExpose({ openCreate, openEdit })
</script>

<style scoped>
.full-width {
  width: 100%;
}
.compact-dragger :deep(.ant-upload-drag) {
  padding: 8px 0;
}
.compact-dragger :deep(.ant-upload-drag-icon) {
  margin-bottom: 4px;
}
.compact-dragger :deep(.ant-upload-text) {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
}
.upload-progress {
  margin-top: 8px;
}
</style>
