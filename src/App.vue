<template>
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
      v-model:Text="searchQuery"
      :ItemsSource="searchResults"
      TextMemberPath="title"
      :PlaceholderText="t('search.placeholder')"
      QueryIcon="Find"
      :OpenOnFocus="true"
      class="app-titlebar-search"
      @QuerySubmitted="onSearchQuerySubmitted" />
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
        :OpenPaneLength="240"
        @ItemInvoked="handleNavClick">
        <router-view v-slot="{ Component }">
          <Transition
            appear
            :enter-active-class="pageTransitionEnter"
            :leave-active-class="pageTransitionLeave">
            <div
              v-if="Component"
              :key="route.path"
              class="page-view">
              <component :is="Component" />
            </div>
          </Transition>
        </router-view>
      </WinNavigationView>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NavigationTrigger_NavigatingTo,
  NavigationTrigger_NavigatingAway,
  createEntranceNavigationTransitionInfo,
  getNavigationTransitionInfoClassName
} from './utils/navigationTransitionInfo'
import WinTitleBar from './components/WinTitleBar.vue'
import WinNavigationView from './components/WinNavigationView.vue'
import WinAutoSuggestBox from './components/WinAutoSuggestBox.vue'
import { createAppI18n } from './i18n'
import { searchDocs } from './utils/searchIndex'
import { getDocs } from './utils/docRegistry'
import { IconGlyphs, type IconName } from './utils/iconGlyphs'
import { generateAccentVariants, DEFAULT_ACCENT_COLOR } from './utils/colorUtils'

const route = useRoute()
const router = useRouter()

const navigationTransitionInfo = createEntranceNavigationTransitionInfo()
const pageTransitionEnter = ref(getNavigationTransitionInfoClassName(navigationTransitionInfo, NavigationTrigger_NavigatingTo))
const pageTransitionLeave = ref(getNavigationTransitionInfoClassName(navigationTransitionInfo, NavigationTrigger_NavigatingAway))

const i18n = createAppI18n()
const t = i18n.t

const appIcon = IconGlyphs.Home

const readAccentColor = (): string => {
  const stored = localStorage.getItem('accentColor')
  if (stored && /^#[0-9a-f]{6}$/i.test(stored)) return stored
  return DEFAULT_ACCENT_COLOR
}

const accentColor = ref<string>(readAccentColor())

const applyAccentColor = () => {
  const html = document.documentElement
  const isDark = html.classList.contains('theme-dark')
  const variants = generateAccentVariants(accentColor.value, isDark)
  for (const [key, value] of Object.entries(variants)) {
    html.style.setProperty(key, value)
  }
}

const readTheme = (): 'light' | 'dark' | 'system' => {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

const theme = ref<'light' | 'dark' | 'system'>(readTheme())

const applyTheme = (mode: 'light' | 'dark' | 'system') => {
  const html = document.documentElement
  html.classList.remove('theme-light', 'theme-dark')
  if (mode === 'light') html.classList.add('theme-light')
  else if (mode === 'dark') html.classList.add('theme-dark')
  applyAccentColor()
}

let systemMedia: MediaQueryList | null = null
let systemListener: (() => void) | null = null

const setupSystemListener = () => {
  cleanupSystemListener()
  if (theme.value !== 'system') return
  systemMedia = window.matchMedia('(prefers-color-scheme: dark)')
  systemListener = () => {
    if (theme.value === 'system') applyTheme('system')
  }
  systemMedia.addEventListener('change', systemListener)
}

const cleanupSystemListener = () => {
  if (systemMedia && systemListener) {
    systemMedia.removeEventListener('change', systemListener)
  }
  systemMedia = null
  systemListener = null
}

watch(theme, (val) => {
  localStorage.setItem('theme', val)
  applyTheme(val)
  if (val === 'system') setupSystemListener()
  else cleanupSystemListener()
}, { immediate: true })

watch(accentColor, (val) => {
  localStorage.setItem('accentColor', val)
  applyAccentColor()
}, { immediate: true })

onUnmounted(cleanupSystemListener)

provide('appTheme', theme)
provide('setAppTheme', (v: 'light' | 'dark' | 'system') => { theme.value = v })
provide('accentColor', accentColor)
provide('setAccentColor', (v: string) => { accentColor.value = v })

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
  if (path === '/prologue') return '/prologue'
  if (path.startsWith('/doc/')) return `/doc/${route.params.id}`
  if (path === '/settings') return '/settings'
  if (path === '/about') return '/about'
  return path
})

const menuItems = computed(() => [
  { value: '/', label: t('nav.home'), icon: IconGlyphs.Home },
  { value: '/prologue', label: t('nav.prologue'), icon: IconGlyphs.Prologue },
  {
    label: t('nav.docs'),
    icon: IconGlyphs.Library,
    children: getDocs().map(doc => ({
      value: `/doc/${doc.id}`,
      label: doc.title,
      icon: doc.icon
    }))
  },
])

const footerItems = computed(() => [
  { value: '/settings', label: t('nav.settings'), icon: IconGlyphs.Settings },
  { value: '/about', label: t('nav.about'), icon: IconGlyphs.Info },
])

const handleNavClick = (args: { InvokedItemContainer: any }) => {
  const item = args?.InvokedItemContainer
  if (item?.value) {
    router.push(item.value)
  }
}

const searchQuery = ref('')
const searchResults = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return []
  const results = searchDocs(query)
  if (results.length === 0) {
    return [{ title: t('search.noResults'), subtitle: '', path: '' }]
  }
  return results
})

const onSearchQuerySubmitted = (args: { QueryText: string; ChosenSuggestion: any }) => {
  const query = String(args.QueryText ?? '').trim()
  if (!query) return
  if (args.ChosenSuggestion?.path) {
    router.push(args.ChosenSuggestion.path)
    return
  }

  // const results = searchDocs(query)
  // if (results.length > 0) {
  //   router.push(results[0].path)
  // }
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

.page-view {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
</style>
