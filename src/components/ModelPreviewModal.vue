<template>
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
        <audio :src="getAssetUrl(previewingMarker.audioPath)" controls preload="metadata" />
      </div>
      <div v-else class="preview-modal__no-audio">Аудио не загружено</div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { getAssetUrl } from '@/api/markers'
import { useModelPreview } from '@/composables/useModelPreview'

const { previewModalVisible, previewingMarker, previewCanvasRef, openPreviewModal } =
  useModelPreview()

defineExpose({ openPreviewModal })
</script>

<style scoped>
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
