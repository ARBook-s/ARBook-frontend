/** Базовый масштаб 3D-моделей (умножается на marker.scale) */
export const BASE_SCALE = 0.3

/** Громкость аудио по умолчанию (0..1) */
export const DEFAULT_VOLUME = 0.7

/** Чувствительность ручного вращения модели (радианы/пиксель) */
export const ROTATION_SENSITIVITY = 0.01

/** MindAR: минимальный cutoff frequency фильтра */
export const FILTER_MIN_CF = 0.0001

/** MindAR: beta-параметр фильтра */
export const FILTER_BETA = 500

/** Максимальный devicePixelRatio для десктопов */
export const MAX_PIXEL_RATIO = 2

/** Максимальный devicePixelRatio для мобильных (экономия GPU) */
export const MAX_PIXEL_RATIO_MOBILE = 1.5

/** FOV камеры превью (градусы) */
export const PREVIEW_FOV = 45

/** Задержка инициализации превью после открытия модалки (мс) */
export const PREVIEW_INIT_DELAY = 50

/** Рендерить 1 из N кадров, когда нет видимых маркеров */
export const IDLE_FRAME_SKIP = 3

/** Максимальный FPS (интервал между кадрами = 1000 / TARGET_FPS) */
export const TARGET_FPS = 30

/** Разрешение камеры (ширина) — меньше = быстрее MindAR */
export const CAMERA_WIDTH = 640

/** Разрешение камеры (высота) */
export const CAMERA_HEIGHT = 480

/** Сколько маркеров трекать одновременно (1 = книга, одна страница за раз) */
export const MAX_TRACK = 1

/** Сколько кадров подряд нужно «увидеть» маркер, чтобы подтвердить обнаружение */
export const WARMUP_TOLERANCE = 3

/** Сколько кадров «потери» маркера допустимо перед вызовом onTargetLost */
export const MISS_TOLERANCE = 5
