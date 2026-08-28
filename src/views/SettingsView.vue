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
              HeaderIcon="&#x0F0224;"
              :Height="70">
              <WinComboBox
                v-model:SelectedValue="themeValue"
                :ItemsSource="themeOptions"
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

const { t } = createAppI18n()

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
