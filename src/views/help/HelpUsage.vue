<template>
  <section class="help-section">
    <h2 class="help-section__title">Как работает AR-книга</h2>
    <ol class="help-section__steps">
      <li class="help-section__step">
        <span class="help-section__step-num">1</span>
        <div>
          <strong>Откройте приложение</strong>
          <p>Зайдите на сайт с телефона и нажмите «Запустить камеру».</p>
        </div>
      </li>
      <li class="help-section__step">
        <span class="help-section__step-num">2</span>
        <div>
          <strong>Разрешите доступ к камере</strong>
          <p>Браузер запросит разрешение — нажмите «Разрешить». Без камеры AR работать не будет.</p>
        </div>
      </li>
      <li class="help-section__step">
        <span class="help-section__step-num">3</span>
        <div>
          <strong>Наведите камеру на маркер</strong>
          <p>Откройте книгу на странице с маркером и направьте камеру телефона на иллюстрацию.</p>
        </div>
      </li>
      <li class="help-section__step">
        <span class="help-section__step-num">4</span>
        <div>
          <strong>Смотрите и слушайте</strong>
          <p>На экране появится 3D-модель, а из динамика — звуковое сопровождение. Модель можно вращать пальцем.</p>
        </div>
      </li>
    </ol>

    <div class="help-section__tip">
      <strong>Совет:</strong> Держите телефон на расстоянии 20–40 см от страницы. Убедитесь, что маркер хорошо освещён.
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

.help-section__steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.help-section__step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.help-section__step-num {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(180deg, #0d5c63 0%, #08464c 100%);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-section__step strong {
  display: block;
  font-size: 0.95rem;
  color: #1a2226;
  margin-bottom: 0.2rem;
}

.help-section__step p {
  margin: 0;
  font-size: 0.9rem;
  color: #5c6b73;
  line-height: 1.5;
}

.help-section__tip {
  margin-top: 1.25rem;
  padding: 0.85rem 1rem;
  background: #eef7f5;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  color: #2c3539;
  line-height: 1.5;
  border-left: 3px solid #0d5c63;
}
</style>
