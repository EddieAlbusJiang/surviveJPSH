<template>
  <div class="home-view">
    <div class="home-header">
      <h1 class="home-title">surviveJPSH</h1>
      <p class="home-subtitle">{{ t('home.subtitle') }}</p>
    </div>
    <div class="home-cards">
      <div class="doc-card" @click="router.push('/doc/study')">
        <div class="card-icon">&#xE943;</div>
        <h2 class="card-title">{{ t('nav.study') }}</h2>
        <p class="card-desc">{{ t('home.study.desc') }}</p>
      </div>
      <div class="doc-card" @click="router.push('/doc/life')">
        <div class="card-icon">&#xE80F;</div>
        <h2 class="card-title">{{ t('nav.life') }}</h2>
        <p class="card-desc">{{ t('home.life.desc') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { createAppI18n } from '../i18n'

const router = useRouter()
const { t } = createAppI18n(navigator.language)
</script>

<style scoped>
.home-view {
  padding: 2rem;
  max-width: 960px;
  margin: 0 auto;
}

.home-header {
  text-align: center;
  margin-bottom: 3rem;
}

.home-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.home-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
}

.home-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.doc-card {
  background: var(--card-bg);
  border: 1px solid var(--ctrl-border);
  border-radius: 8px;
  padding: 2rem;
  cursor: pointer;
  transition: all var(--fast-duration) var(--fast-out-slow-in);
}

.doc-card:hover {
  background: var(--subtle-secondary);
  border-color: var(--accent-border);
  transform: translateY(-2px);
}

.card-icon {
  font-family: var(--SymbolThemeFontFamily, 'WinUIOnWebIcons');
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--accent-base);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.card-desc {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}
</style>
