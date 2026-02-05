declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  import type { Loader, LoadingManager } from 'three'

  export class GLTFLoader extends Loader {
    constructor(manager?: LoadingManager)
    loadAsync(url: string): Promise<{ scene: unknown; animations: unknown[] }>
  }
}
