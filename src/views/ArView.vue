<template>
  <div v-if="!started" class="start">
    <h2>AR-книга</h2>
    <button @click="start">Запустить</button>
    <router-link to="/admin" class="start__admin">Админ</router-link>
  </div>

  <div ref="container" class="ar" :class="{ 'ar--active': started }"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import 'mind-ar-ts/src/image-target/index'
import MindARThree from 'mind-ar-ts/src/image-target/three'
import { getMarkers, getAssetUrl } from '@/api/markers'

const container = ref<HTMLDivElement | null>(null)
const started = ref(false)

let mindar: MindARThree
let mixer: THREE.AnimationMixer

const start = async () => {
  if (!container.value) return
  started.value = true

  const markers = await getMarkers()
  const marker = markers[0]
  if (!marker) {
    console.error('Нет маркеров')
    return
  }

  const mindUrl = getAssetUrl(marker.mindFilePath)
  const glbUrl = getAssetUrl(marker.glbModelPath)
  const audioUrl = getAssetUrl(marker.audioPath)

  mindar = new MindARThree({
    container: container.value,
    imageTargetSrc: mindUrl,
    maxTrack: 1,
    uiLoading: 'no',
    uiScanning: 'no',
    uiError: 'no',
  })

  const scene = (mindar as unknown as { scene: THREE.Scene }).scene
  const camera = (mindar as unknown as { camera: THREE.PerspectiveCamera }).camera
  const renderer = (mindar as unknown as { renderer: THREE.WebGLRenderer }).renderer

  scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1))

  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(glbUrl)

  const model = gltf.scene as THREE.Group
  model.scale.setScalar(marker.scale)

  const anchor = mindar.addAnchor(0)
  anchor.group.add(model)

  mixer = new THREE.AnimationMixer(model)
  for (const clip of gltf.animations) {
    mixer.clipAction(clip as THREE.AnimationClip).play()
  }

  const listener = new THREE.AudioListener()
  camera.add(listener)
  const sound = new THREE.Audio(listener)

  new THREE.AudioLoader().load(audioUrl, (buffer) => {
    sound.setBuffer(buffer)
    sound.setLoop(true)
    sound.setVolume(0.7)
  })

  const anchorObj = anchor as unknown as { onTargetFound: () => void; onTargetLost: () => void }
  anchorObj.onTargetFound = () => {
    sound.play()
  }
  anchorObj.onTargetLost = () => {
    sound.pause()
  }

  await mindar.start()

  renderer.setAnimationLoop(() => {
    mixer.update(0.016)
    renderer.render(scene, camera)
  })
}
</script>

<style scoped>
.ar {
  position: fixed;
  inset: 0;
  pointer-events: none;
}
.ar--active {
  pointer-events: auto;
}
.start {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  background: #000;
  color: white;
}
.start__admin {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #888;
  font-size: 0.9rem;
  text-decoration: none;
}
.start__admin:hover {
  color: #fff;
}
</style>
