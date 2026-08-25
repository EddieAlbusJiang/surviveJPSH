<template>
  <WinThemeWrapper :Theme="theme">
    <WinTitleBar :Title="t('app.title')" :IconSource="appIcon" />
    <WinNavigationView
      :MenuItems="menuItems"
      :FooterMenuItems="footerItems"
      :SelectedItem="currentRoute"
      :PaneTitle="t('app.title')"
      :IsSettingsVisible="false"
      @ItemInvoked="handleNavClick"
    >
      <template #AutoSuggestBox>
        <WinAutoSuggestBox
          :PlaceholderText="t('search.placeholder')"
          @QuerySubmitted="handleSearchSubmit"
        />
      </template>
      <router-view />
    </WinNavigationView>
  </WinThemeWrapper>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WinThemeWrapper from './components/WinThemeWrapper.vue'
import WinTitleBar from './components/WinTitleBar.vue'
import WinNavigationView from './components/WinNavigationView.vue'
import WinAutoSuggestBox from './components/WinAutoSuggestBox.vue'
import { createAppI18n } from './i18n'

const route = useRoute()
const router = useRouter()

const i18n = createAppI18n(navigator.language)
const t = i18n.t

const appIcon = '\uE80F'

const theme = ref<'light' | 'dark' | 'system'>(
  (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
)

provide('appTheme', theme)
provide('setAppTheme', (v: 'light' | 'dark' | 'system') => {
  theme.value = v
  localStorage.setItem('theme', v)
})

const currentRoute = computed(() => {
  const path = route.path
  if (path === '/') return '/'
  if (path.startsWith('/doc/')) return `/doc/${route.params.id}`
  if (path === '/settings') return '/settings'
  if (path === '/about') return '/about'
  return path
})

const menuItems = computed(() => [
  { value: '/', label: t('nav.home'), icon: '\uE80F' },
  {
    value: 'docs',
    label: t('nav.docs'),
    icon: '\uE943',
    children: [
      { value: '/doc/study', label: t('nav.study') },
      { value: '/doc/life', label: t('nav.life') },
    ]
  },
])

const footerItems = computed(() => [
  { value: '/settings', label: t('nav.settings'), icon: '\uE713' },
  { value: '/about', label: t('nav.about'), icon: '\uE946' },
])

const handleNavClick = (args: { InvokedItemContainer: any }) => {
  const item = args?.InvokedItemContainer
  if (item?.value) {
    router.push(item.value)
  }
}

const handleSearchSubmit = (args: { QueryText: string; ChosenSuggestion: any }) => {
  const query = args.QueryText?.toLowerCase() || ''
  if (query.includes('学习') || query.includes('study')) {
    router.push('/doc/study')
  } else if (query.includes('生活') || query.includes('life')) {
    router.push('/doc/life')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
  if (savedTheme) {
    theme.value = savedTheme
  }
})
</script>
