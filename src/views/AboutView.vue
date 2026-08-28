<template>
  <WinScrollViewer class="about-scroll">
    <div class="about-view">
      <h4>Preview v0.2.1</h4>
      <h1 class="about-title">{{ t('about.title') }}</h1>

      <WinExpander :Header="t('about.project')" :IsOpen="true">
        <div class="about-section">
          <p>{{ t('about.project.desc') }}</p>
          <ul>
            <li>{{ t('about.project.tech') }}</li>
            <li>{{ t('about.project.deploy') }}</li>
          </ul>
        </div>
      </WinExpander>

      <WinExpander :Header="t('about.authors')">
        <div class="about-section">
          <p>{{ t('about.authors.desc') }}</p>
        </div>
      </WinExpander>

      <WinExpander :Header="t('about.license')">
        <div class="about-section">
          <p>{{ t('about.license.desc') }}</p>
          <p>{{ t('about.license.uirepo') }}<a href="https://github.com/Furry-Xiyi/WinUIonWeb">https://github.com/Furry-Xiyi/WinUIonWeb</a></p>
        </div>
      </WinExpander>

      <WinExpander :Header="t('about.contributing')">
        <div class="about-section">
          <p>{{ t('about.contributing.desc') }}</p>
          <p>{{ t('about.contributing.repo') }}<a href="https://github.com/EddieAlbusJiang/surviveJPSH">https://github.com/EddieAlbusJiang/surviveJPSH</a></p>
        </div>
      </WinExpander>
    </div>
  </WinScrollViewer>
</template>

<script setup lang="ts">
import WinExpander from '../components/WinExpander.vue'
import WinScrollViewer from '../components/WinScrollViewer.vue'
import { createAppI18n } from '../i18n'

const { t } = createAppI18n(localStorage.getItem('locale') || navigator.language)
</script>

<style scoped>
.about-scroll {
  height: 100%;
  min-height: 0;
}

.about-view {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.about-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 2rem 0;
  color: var(--text-primary);
}

.about-section {
  padding: 1rem 0;
}

.about-section p {
  margin: 0 0 1rem 0;
  line-height: 1.6;
  color: var(--text-primary);
}

.about-section ul {
  margin: 0;
  padding-left: 1.5rem;
}

.about-section li {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.license-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--accent-base);
  color: white;
  border-radius: 4px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .about-view {
    padding: 1rem;
  }
}
</style>
