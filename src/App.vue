<template>
  <WinThemeWrapper :Theme="theme">
    <WinTitleBar
      :Title="t('app.title')"
      PreferredHeightOption="Tall"
      :IsBackButtonVisible="canGoBack"
      :IsBackButtonEnabled="canGoBack"
      :IsPaneToggleButtonVisible="true"
      TitleBarContentHorizontalAlignment="Stretch"
      :IconSource="appIcon"
      @BackRequested="onBackRequested"
      @PaneToggleRequested="onTopBarToggle">
      <WinAutoSuggestBox
        :PlaceholderText="t('search.placeholder')"
        class="app-titlebar-search"
        @QuerySubmitted="handleSearchSubmit" />
    </WinTitleBar>
    <div class="app-content wco-titlebar">
      <div class="nav-host">
        <WinNavigationView
          v-model:IsPaneOpen="isPaneOpen"
          :MenuItems="menuItems"
          :FooterMenuItems="footerItems"
          :SelectedItem="currentRoute"
          :IsSettingsVisible="false"
          IsBackButtonVisible="Collapsed"
          :IsPaneToggleButtonVisible="false"
          :IsBackEnabled="canGoBack"
          @ItemInvoked="handleNavClick">
          <router-view />
        </WinNavigationView>
      </div>
    </div>
  </WinThemeWrapper>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WinThemeWrapper from './components/WinThemeWrapper.vue'
import WinTitleBar from './components/WinTitleBar.vue'
import WinNavigationView from './components/WinNavigationView.vue'
import WinAutoSuggestBox from './components/WinAutoSuggestBox.vue'
import { createAppI18n } from './i18n'

const route = useRoute()
const router = useRouter()

const i18n = createAppI18n(localStorage.getItem('locale') || navigator.language)
const t = i18n.t

const appIcon = '\uE80F'

const theme = ref<'light' | 'dark' | 'system'>(
  (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
)

provide('appTheme', theme)
provide('setAppTheme', (v: 'light' | 'dark' | 'system') => {
  theme.value = v
  localStorage.setItem('theme', v)
  location.reload()
})

const canGoBack = ref(Boolean(router.options.history.state?.back))
router.afterEach(() => {
  canGoBack.value = Boolean(history.state?.back) && (route.path != '/')
})
const onBackRequested = () => {
  if (canGoBack.value) router.back()
}

const isPaneOpen = ref(true)
const onTopBarToggle = () => {
  isPaneOpen.value = !isPaneOpen.value
}

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
</script>

<style scoped>
.app-content {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.app-content.wco-titlebar {
  box-sizing: border-box;
  padding-top: max(env(titlebar-area-height, 0px), 48px);
}

.nav-host {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
}

.nav-host > :deep(.win-nav-shell) {
  width: 100%;
  height: 100%;
}

.app-titlebar-search {
  width: 100%;
  max-width: 350px;
}
</style>
