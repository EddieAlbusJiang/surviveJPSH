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
            <WinSettingsCard
              :Header="t('settings.accentColor')"
              :Description="t('settings.accentColor.desc')"
              HeaderIcon="&#x0F0CB3;">
              <div class="accent-color-control">
                <div class="color-presets">
                  <button
                    v-for="c in presetColors"
                    :key="c"
                    class="color-swatch"
                    :class="{ selected: accentColorValue === c.toLowerCase() }"
                    :style="{ background: c }"
                    :aria-label="c"
                    role="radio"
                    :aria-checked="accentColorValue === c.toLowerCase()"
                    @click="onPresetClick(c.toLowerCase())" />
                </div>
                <div class="color-input-row">
                  <WinTextBox
                    v-model:Text="accentColorText"
                    :MaxLength=7
                    PlaceholderText="#0067C0"
                    @update:Text="onAccentColorTextInput" />
                  <WinButton
                    Style={StaticResource SubtleButtonStyle}
                    :Content="t('settings.accentColor.reset')"
                    @Click="onResetAccentColor" />
                </div>
              </div>
            </WinSettingsCard>
          </div>
        </div>
      </div>
    </WinScrollViewer>
  </WinGrid>
</template>

<script setup lang="ts">
import { inject, computed, ref, watch } from 'vue'
import WinGrid from '../components/WinGrid.vue'
import WinScrollViewer from '../components/WinScrollViewer.vue'
import WinTextBlock from '../components/WinTextBlock.vue'
import WinSettingsCard from '../components/WinSettingsCard.vue'
import WinComboBox from '../components/WinComboBox.vue'
import WinTextBox from '../components/WinTextBox.vue'
import WinButton from '../components/WinButton.vue'
import { createAppI18n } from '../i18n'
import { PRESET_COLORS, DEFAULT_ACCENT_COLOR } from '../utils/colorUtils'

const { t } = createAppI18n()

const appTheme = inject<import('vue').Ref<string>>('appTheme')
const setAppTheme = inject<(v: string) => void>('setAppTheme')
const accentColor = inject<import('vue').Ref<string>>('accentColor')
const setAccentColor = inject<(v: string) => void>('setAccentColor')

const presetColors = [...PRESET_COLORS]

const accentColorValue = computed({
  get: () => accentColor?.value ?? DEFAULT_ACCENT_COLOR,
  set: (v: string) => setAccentColor?.(v),
})

const accentColorText = ref(accentColorValue.value.toUpperCase())

const onPresetClick = (color: string) => {
  setAccentColor?.(color)
}

const onAccentColorTextInput = (val: string) => {
  const v = val.trim()
  if (/^#[0-9a-f]{6}$/i.test(v)) {
    setAccentColor?.(v.toLowerCase())
    accentColorText.value = v.toUpperCase()
  }
}

const onResetAccentColor = () => {
  setAccentColor?.(DEFAULT_ACCENT_COLOR)
  accentColorText.value = DEFAULT_ACCENT_COLOR.toUpperCase()
}

if (accentColor) {
  watch(accentColor, (val) => {
    if (val) accentColorText.value = val.toUpperCase()
  })
}

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

.accent-color-control {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  margin: 0;
  outline: none;
  transition: transform var(--fast-duration) var(--fast-out-slow-in), border-color var(--fast-duration) var(--fast-out-slow-in);
}

.color-swatch:hover {
  transform: scale(1.15);
}

.color-swatch:focus-visible {
  outline: 2px solid var(--accent-base);
  outline-offset: 2px;
}

.color-swatch.selected {
  border-color: var(--text-primary);
  transform: scale(1.1);
}

.color-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input-row :deep(.win-text-box) {
  width: 120px;
}
</style>
