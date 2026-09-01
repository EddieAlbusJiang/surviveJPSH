<template>
  <WinScrollViewer class="about-scroll">
    <div class="about-view">
      <h1 class="about-title">{{ t('about.title') }}</h1>
      <div class="about-version">
      <img src="https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge"/>
      &emsp;
      <img src="https://img.shields.io/badge/preview-0.3.2-blue?style=for-the-badge"/>
      </div>
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
          <p>{{ t('about.contributing.repo') }}
            <a href="https://github.com/EddieAlbusJiang/surviveJPSH">https://github.com/EddieAlbusJiang/surviveJPSH</a></p>
          <p>{{ t('about.contributing.mail') }}
            <a href="=mailto:EternalStarfield@yeah.net">EternalStarfield@yeah.net</a></p>
          <p>{{ t('about.contributing.anymore') }}</p>
        </div>
      </WinExpander>
    </div>
  </WinScrollViewer>
</template>

<script setup lang="ts">
import WinExpander from '../components/WinExpander.vue'
import WinScrollViewer from '../components/WinScrollViewer.vue'
import { createAppI18n } from '../i18n'

const { t } = createAppI18n()
</script>

<style scoped>
.about-scroll {
  height: 100%;
  min-height: 0;
}

.about-view {
  margin: 24px 36px 36px;
  /* padding: 24px 36px 36px; */
  /* max-width: 800px; */
  /* margin: 0 auto; */
}

.about-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.about-version {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 3px;
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
