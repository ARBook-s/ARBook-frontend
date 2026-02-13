declare module 'mind-ar-ts/src/image-target/three' {
  import type * as THREE from 'three'
  export default class MindARThree {
    constructor(options: {
      container: HTMLDivElement
      imageTargetSrc: string
      maxTrack: number
      uiLoading?: string
      uiScanning?: string
      uiError?: string
      filterMinCF?: number
      filterBeta?: number
    })
    start(): Promise<void>
    stop(): void
    addAnchor(targetIndex: number): {
      group: THREE.Group
      targetIndex: number
      onTargetFound: (() => void) | null
      onTargetLost: (() => void) | null
    }
  }
}

declare module 'mind-ar-ts/src/image-target/index' {
  const _: unknown
  export default _
}
