declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  import type { Loader, LoadingManager } from 'three'
  import type { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

  export class GLTFLoader extends Loader {
    constructor(manager?: LoadingManager)
    setDRACOLoader(dracoLoader: DRACOLoader): this
    loadAsync(url: string): Promise<{ scene: unknown; animations: unknown[] }>
  }
}

declare module 'three/examples/jsm/loaders/DRACOLoader.js' {
  import type { Loader, LoadingManager } from 'three'

  export class DRACOLoader extends Loader {
    constructor(manager?: LoadingManager)
    setDecoderPath(path: string): this
    setDecoderConfig(config: Record<string, unknown>): this
    preload(): this
    dispose(): void
  }
}
