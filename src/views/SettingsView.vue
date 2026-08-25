<template>
  <div class="settings-view">
    <h1 class="settings-title">{{ t('settings.title') }}</h1>

    <WinExpander :Header="t('settings.appearance')" :IsOpen="true">
      <div class="settings-section">
        <WinComboBox
          :Header="t('settings.theme')"
          :ItemsSource="themeOptions"
          :SelectedIndex="themeIndex"
          @SelectionChanged="onThemeChange"
        />
      </div>
    </WinExpander>

    <WinExpander :Header="t('settings.language')" :IsOpen="true">
      <div class="settings-section">
        <WinComboBox
          :Header="t('settings.language')"
          :ItemsSource="languageOptions"
          :SelectedIndex="languageIndex"
          @SelectionChanged="onLanguageChange"
        />
      </div>
    </WinExpander>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed } from 'vue'
import WinExpander from '../components/WinExpander.vue'
import WinComboBox from '../components/WinComboBox.vue'
import { createAppI18n } from '../i18n'

const { t } = createAppI18n(navigator.language)

const appTheme = inject<import('vue').Ref<string>>('appTheme', ref('system'))
const setAppTheme = inject<(v: 'light' | 'dark' | 'system') => void>('setAppTheme', () => {})

const themeOptions = computed(() => [
  { label: t('settings.theme.light') },
  { label: t('settings.theme.dark') },
  { label: t('settings.theme.system') },
])

const themeMap: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']

const themeIndex = computed(() => {
  const idx = themeMap.indexOf(appTheme.value as 'light' | 'dark' | 'system')
  return idx >= 0 ? idx : 2
})

const onThemeChange = (args: { AddedItems: any[] }) => {
  const item = args?.AddedItems?.[0]
  const label = item?.label ?? item
  const idx = themeOptions.value.findIndex((o) => o.label === label)
  if (idx >= 0) {
    setAppTheme(themeMap[idx])
  }
}

const languageOptions = computed(() => [
  { label: t('settings.language.zh') },
  { label: t('settings.language.en') },
])

const localeMap = ['zh-CN', 'en-US']

const languageIndex = computed(() => {
  const saved = localStorage.getItem('locale') || navigator.language
  const idx = localeMap.indexOf(saved)
  return idx >= 0 ? idx : 0
})

const onLanguageChange = (args: { AddedItems: any[] }) => {
  const item = args?.AddedItems?.[0]
  const label = item?.label ?? item
  const idx = languageOptions.value.findIndex((o) => o.label === label)
  if (idx >= 0) {
    localStorage.setItem('locale', localeMap[idx])
    location.reload()
  }
}
</script>

<style scoped>
.settings-view {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.settings-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 2rem 0;
  color: var(--text-primary);
}

.settings-section {
  padding: 1rem 0;
}

@media (max-width: 768px) {
  .settings-view {
    padding: 1rem;
  }
}
</style>
