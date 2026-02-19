<template>
  <section class="help-section">
    <h2 class="help-section__title">Добавить на экран телефона</h2>
    <p class="help-section__text">
      Вы можете добавить ARBook как приложение — оно будет открываться с домашнего экрана без адресной строки.
    </p>

    <div class="help-section__platform">
      <h3 class="help-section__subtitle">iPhone / iPad (Safari)</h3>
      <ol class="help-section__list">
        <li>Откройте сайт в <strong>Safari</strong> (в Chrome на iOS это не работает)</li>
        <li>Нажмите кнопку <strong>«Поделиться»</strong> <span class="help-section__hint">(квадрат со стрелкой вверх, внизу экрана)</span></li>
        <li>Пролистайте вниз и нажмите <strong>«На экран Домой»</strong></li>
        <li>Нажмите <strong>«Добавить»</strong></li>
      </ol>
    </div>

    <div class="help-section__platform">
      <h3 class="help-section__subtitle">Android (Chrome)</h3>
      <ol class="help-section__list">
        <li>Откройте сайт в <strong>Chrome</strong></li>
        <li>Нажмите <strong>три точки</strong> <span class="help-section__hint">(меню, правый верхний угол)</span></li>
        <li>Выберите <strong>«Добавить на главный экран»</strong> или <strong>«Установить приложение»</strong></li>
        <li>Подтвердите — <strong>«Установить»</strong></li>
      </ol>
    </div>

    <div class="help-section__tip">
      После установки приложение будет открываться в полноэкранном режиме. Модели и звуки кэшируются, поэтому повторные запуски будут быстрее.
    </div>
  </section>
</template>

<style scoped>
.help-section {
  background: #fff;
  border-radius: 1.25rem;
  padding: 1.75rem 1.5rem;
  box-shadow:
    0 4px 16px rgba(44, 53, 57, 0.06),
    0 1px 4px rgba(44, 53, 57, 0.03);
}

.help-section__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1.25rem;
  color: #1a2226;
}

.help-section__text {
  font-size: 0.95rem;
  color: #5c6b73;
  line-height: 1.6;
  margin: 0 0 1.25rem;
}

.help-section__subtitle {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  color: #0d5c63;
}

.help-section__platform {
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: #faf8f5;
  border-radius: 0.75rem;
}

.help-section__platform:last-of-type {
  margin-bottom: 0.75rem;
}

.help-section__list {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.help-section__list li {
  font-size: 0.9rem;
  color: #2c3539;
  line-height: 1.5;
}

.help-section__hint {
  color: #8a959b;
  font-size: 0.85rem;
}

.help-section__tip {
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  background: #eef7f5;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  color: #2c3539;
  line-height: 1.5;
  border-left: 3px solid #0d5c63;
}
</style>
