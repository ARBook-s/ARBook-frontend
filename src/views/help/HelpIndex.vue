<template>
  <div class="help-index">
    <h2 class="help-index__title">Справка</h2>
    <p class="help-index__subtitle">Выберите раздел</p>

    <nav class="help-index__nav" aria-label="Разделы справки">
      <router-link to="/help/usage" class="help-index__card">
        <span class="help-index__icon">📖</span>
        <div>
          <strong>Как работает AR-книга</strong>
          <p>Пошаговая инструкция по использованию</p>
        </div>
        <span class="help-index__arrow">&rsaquo;</span>
      </router-link>

      <router-link to="/help/install" class="help-index__card">
        <span class="help-index__icon">📱</span>
        <div>
          <strong>Установка на телефон</strong>
          <p>Добавить приложение на домашний экран</p>
        </div>
        <span class="help-index__arrow">&rsaquo;</span>
      </router-link>

      <router-link to="/help/faq" class="help-index__card">
        <span class="help-index__icon">❓</span>
        <div>
          <strong>Частые вопросы</strong>
          <p>Камера, звук, производительность</p>
        </div>
        <span class="help-index__arrow">&rsaquo;</span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.help-index__title {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: #1a2226;
}

.help-index__subtitle {
  font-size: 0.95rem;
  color: #5c6b73;
  margin: 0 0 1.5rem;
}

.help-index__nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.help-index__card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #fff;
  border-radius: 1rem;
  padding: 1.25rem 1rem;
  text-decoration: none;
  color: inherit;
  box-shadow:
    0 4px 16px rgba(44, 53, 57, 0.06),
    0 1px 4px rgba(44, 53, 57, 0.03);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.help-index__card:hover {
  transform: translateY(-1px);
  box-shadow:
    0 6px 20px rgba(44, 53, 57, 0.1),
    0 2px 6px rgba(44, 53, 57, 0.05);
}

.help-index__card:active {
  transform: translateY(0);
}

.help-index__icon {
  font-size: 1.75rem;
  flex-shrink: 0;
  width: 2.75rem;
  text-align: center;
}

.help-index__card div {
  flex: 1;
  min-width: 0;
}

.help-index__card strong {
  display: block;
  font-size: 1rem;
  color: #1a2226;
  margin-bottom: 0.15rem;
}

.help-index__card p {
  margin: 0;
  font-size: 0.85rem;
  color: #5c6b73;
  line-height: 1.4;
}

.help-index__arrow {
  flex-shrink: 0;
  font-size: 1.5rem;
  color: #bbb;
  font-weight: 300;
}
</style>
