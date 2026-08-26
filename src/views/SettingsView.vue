<template>
  <WinGrid class="settings-page-root" RowDefinitions="Auto,*">
    <WinTextBlock
      class="settings-page-header"
      AutomationProperties.HeadingLevel="Level1"
      FontSize="28"
      FontWeight="600"
      LineHeight="36"
      Margin="36,24,36,30"
      Style="{StaticResource TitleTextBlockStyle}"
      TextWrapping="NoWrap"
      :Text="t('settings.title')" />
    <WinScrollViewer
      class="settings-page-scroll"
      VerticalScrollBarVisibility="Auto"
      VerticalScrollMode="Auto">
      <div class="gallery-item-page settings-page-body">
        <div class="gallery-page-content">
          <WinTextBlock class="settings-section-title" :Text="t('settings.appearance')" />
          <div class="settings-controls">
            <WinSettingsCard
              :Header="t('settings.theme')"
              :Description="t('settings.theme.desc')"
              HeaderIcon="&#xF45B;"
              :Height="70">
              <WinComboBox
                v-model:SelectedValue="themeValue"
                :ItemsSource="themeOptions"
                DisplayMemberPath="label"
                SelectedValuePath="value" />
            </WinSettingsCard>
            <WinSettingsCard
              :Header="t('settings.language')"
              :Description="t('settings.language.desc')"
              HeaderIcon="&#xF2E6;"
              :Height="70">
              <WinComboBox
                v-model:SelectedValue="languageValue"
                :ItemsSource="languageOptions"
                DisplayMemberPath="label"
                SelectedValuePath="value" />
            </WinSettingsCard>
          </div>
        </div>
      </div>
    </WinScrollViewer>
  </WinGrid>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import WinGrid from '../components/WinGrid.vue'
import WinScrollViewer from '../components/WinScrollViewer.vue'
import WinTextBlock from '../components/WinTextBlock.vue'
import WinSettingsCard from '../components/WinSettingsCard.vue'
import WinComboBox from '../components/WinComboBox.vue'
import { createAppI18n } from '../i18n'

const { t } = createAppI18n(localStorage.getItem('locale') || navigator.language)

const appTheme = inject<import('vue').Ref<string>>('appTheme')
const setAppTheme = inject<(v: string) => void>('setAppTheme')

const themeOptions = [
  { label: t('settings.theme.system'), value: 'system' },
  { label: t('settings.theme.light'), value: 'light' },
  { label: t('settings.theme.dark'), value: 'dark' },
]

const themeValue = computed({
  get: () => appTheme?.value ?? 'system',
  set: (v: string) => setAppTheme?.(v),
})

const normalizeLocale = (locale: string) => {
  if (locale.startsWith('zh')) return 'zh-CN'
  if (locale.startsWith('en')) return 'en-US'
  return 'zh-CN'
}

const languageOptions = [
  { label: t('settings.language.zh'), value: 'zh-CN' },
  { label: t('settings.language.en'), value: 'en-US' },
]

const languageValue = computed({
  get: () => normalizeLocale(localStorage.getItem('locale') || navigator.language),
  set: (v: string) => {
    localStorage.setItem('locale', v)
    location.reload()
  },
})
</script>

<style scoped>
.settings-page-root {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.settings-page-header {
  max-width: 1064px;
}

.settings-page-scroll {
  grid-row: 2;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.settings-page-body {
  padding-top: 0;
}

.settings-section-title {
  font-size: 14px;
  font-weight: 600;
}

.settings-controls {
  display: flex;
  flex-direction: column;
  margin-top: 6px;
  margin-bottom: 32px;
}

.settings-controls :deep(.win-settings-card) {
  margin-bottom: 4px;
}
</style>
