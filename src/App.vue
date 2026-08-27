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
                :key="route.fullPath"
                class="page-view">
                <component :is="Component" />
              </div>
            </Transition>
          </router-view>
        </WinNavigationView>
      </div>
    </div>
  </WinThemeWrapper>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NavigationTrigger_NavigatingTo,
  NavigationTrigger_NavigatingAway,
  createEntranceNavigationTransitionInfo,
  getNavigationTransitionInfoClassName
} from './utils/navigationTransitionInfo'
import WinThemeWrapper from './components/WinThemeWrapper.vue'
import WinTitleBar from './components/WinTitleBar.vue'
import WinNavigationView from './components/WinNavigationView.vue'
import WinAutoSuggestBox from './components/WinAutoSuggestBox.vue'
import { createAppI18n } from './i18n'
import { searchDocs } from './utils/searchIndex'
import { IconGlyphs } from './utils/iconGlyphs'

const route = useRoute()
const router = useRouter()

const navigationTransitionInfo = createEntranceNavigationTransitionInfo()
const pageTransitionEnter = ref(getNavigationTransitionInfoClassName(navigationTransitionInfo, NavigationTrigger_NavigatingTo))
const pageTransitionLeave = ref(getNavigationTransitionInfoClassName(navigationTransitionInfo, NavigationTrigger_NavigatingAway))

const i18n = createAppI18n(localStorage.getItem('locale') || navigator.language)
const t = i18n.t

const appIcon = IconGlyphs.Home

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
  { value: '/', label: t('nav.home'), icon: IconGlyphs.Home },
  {
    label: t('nav.docs'),
    icon: IconGlyphs.Library,
    children: [
      { value: '/doc/study', label: t('nav.study'), icon: IconGlyphs.Pen},
      { value: '/doc/life', label: t('nav.life'), icon: IconGlyphs.Life},
    ]
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
  const locale = localStorage.getItem('locale') || navigator.language
  const results = searchDocs(query, locale)
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

  // const locale = localStorage.getItem('locale') || navigator.language
  // const results = searchDocs(query, locale)
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
