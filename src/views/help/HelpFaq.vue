<template>
  <section class="help-section">
    <h2 class="help-section__title">Частые вопросы</h2>

    <details class="help-section__faq">
      <summary>Камера не включается</summary>
      <p>Убедитесь, что вы разрешили доступ к камере. В настройках телефона проверьте разрешения для браузера. На iOS используйте только Safari.</p>
    </details>

    <details class="help-section__faq">
      <summary>Модель не появляется</summary>
      <p>Держите камеру ровно, маркер должен быть полностью виден. Проверьте освещение — в темноте камера может не распознать маркер.</p>
    </details>

    <details class="help-section__faq">
      <summary>Нет звука</summary>
      <p>Нажмите на подсказку «Нажмите для включения звука» внизу экрана. На мобильных устройствах браузер блокирует автовоспроизведение до первого касания.</p>
    </details>

    <details class="help-section__faq">
      <summary>Всё тормозит</summary>
      <p>Закройте другие вкладки и приложения. AR использует камеру, GPU и процессор одновременно, поэтому на слабых устройствах возможно замедление.</p>
    </details>
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
  margin: 0 0 0.75rem;
  color: #1a2226;
}

.help-section__faq {
  border-bottom: 1px solid rgba(44, 53, 57, 0.08);
  padding: 0.75rem 0;
}

.help-section__faq:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.help-section__faq summary {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a2226;
  cursor: pointer;
  padding: 0.25rem 0;
  user-select: none;
  transition: color 0.15s;
}

.help-section__faq summary:hover {
  color: #0d5c63;
}

.help-section__faq p {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #5c6b73;
  line-height: 1.6;
}
</style>
