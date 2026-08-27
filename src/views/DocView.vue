<template>
  <div class="doc-view">
    <div class="doc-topbar">
      <button
        type="button"
        class="doc-topbar-toggle"
        data-nav-pane-toggle
        :aria-label="tocToggleLabel"
        v-bind="{ 'tooltipservice.tooltip': tocToggleLabel }"
        @mousedown="onTocToggleDown"
        @mouseup="onTocToggleUp"
        @mouseleave="onTocToggleLeave"
        @click="toggleTocPane">
        <span
          class="icon animated-icon animated-icon-hamburger"
          :class="tocHamburgerClass"
          aria-hidden="true"
          @animationend="onTocToggleAnimEnd">{{ IconGlyphs.Navigation }}</span>
      </button>
      <WinBreadcrumbBar
        class="doc-topbar-breadcrumb"
        :ItemsSource="headingPath.map(p => p.text)"
        IsEnabled="false" />
    </div>

    <WinNavigationView
      v-model:IsPaneOpen="isTocOpen"
      :MenuItems="tocMenuItems"
      :SelectedItem="activeHeadingId"
      PaneDisplayMode="Auto"
      :CompactModeThresholdWidth="900"
      :ExpandedModeThresholdWidth="900"
      :OpenPaneLength="240"
      :PaneTitle="t('doc.contents')"
      :IsSettingsVisible="false"
      :IsPaneToggleButtonVisible="false"
      IsBackButtonVisible="Collapsed"
      @ItemInvoked="onTocItemInvoked">

      <WinScrollViewer ref="scrollViewer" class="doc-scroll" @ViewChanged="onDocumentScroll">
        <div ref="contentElement" class="doc-content markdown-body" v-html="renderedMarkdown"></div>
      </WinScrollViewer>
    </WinNavigationView>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WinNavigationView from '../components/WinNavigationView.vue'
import WinScrollViewer from '../components/WinScrollViewer.vue'
import WinBreadcrumbBar from '../components/WinBreadcrumbBar.vue'
import { parseMarkdown } from '../utils/markdown'
import { slugify } from '../utils/searchIndex'
import { IconGlyphs } from '../utils/iconGlyphs'
import { createAppI18n } from '../i18n'

interface DocumentHeading {
  id: string
  text: string
  level: number
}

interface TocMenuItem {
  value: string
  label: string
  children?: TocMenuItem[]
}

interface ScrollViewerExpose {
  scrollViewerRef?: HTMLDivElement | { value?: HTMLDivElement }
}

const route = useRoute()
const router = useRouter()
const { t } = createAppI18n(localStorage.getItem('locale') || navigator.language)
const content = ref('')
const contentElement = ref<HTMLElement>()
const scrollViewer = ref<ScrollViewerExpose>()
const headings = ref<DocumentHeading[]>([])
const tocHeadings = computed(() => headings.value.filter(h => h.level > 1))
const activeHeadingId = ref('')
const isTocOpen = ref(typeof window === 'undefined' || window.innerWidth >= 900)
let scrollFrame = 0

const headingPath = computed(() => {
  if (!activeHeadingId.value || !headings.value.length) return []
  const activeIdx = headings.value.findIndex(h => h.id === activeHeadingId.value)
  if (activeIdx < 0) return []
  const stack: (DocumentHeading)[] = []
  for (let i = 0; i <= activeIdx; i++) {
    const h = headings.value[i]
    while (stack.length && stack[stack.length - 1].level >= h.level) stack.pop()
    stack.push(h)
  }
  return stack.map(({ text, id }) => ({ text, id }))
})

const tocHamburgerClass = ref('')
let tocHamburgerPressed = false
let tocHamburgerPressDone = false

const tocToggleLabel = computed(() => t(isTocOpen.value ? 'text.close-navigation' : 'text.open-navigation'))

const onTocToggleDown = () => {
  tocHamburgerPressed = true
  tocHamburgerPressDone = false
  tocHamburgerClass.value = 'pressing'
}

const onTocToggleUp = () => {
  if (!tocHamburgerPressed) return
  tocHamburgerPressed = false
  if (tocHamburgerPressDone) tocHamburgerClass.value = 'releasing'
}

const onTocToggleLeave = onTocToggleUp

const onTocToggleAnimEnd = (event: AnimationEvent) => {
  if (tocHamburgerClass.value === 'pressing' && event.animationName === 'hamburger-press') {
    tocHamburgerPressDone = true
    if (!tocHamburgerPressed) tocHamburgerClass.value = 'releasing'
  } else if (tocHamburgerClass.value === 'releasing' && event.animationName === 'hamburger-release') {
    tocHamburgerClass.value = ''
    tocHamburgerPressDone = false
  }
}

const toggleTocPane = () => {
  isTocOpen.value = !isTocOpen.value
}

const mdModules = import.meta.glob('/src/docs/*.md', {
  query: '?raw',
  import: 'default'
})

const renderedMarkdown = computed(() => parseMarkdown(content.value))

function getScrollViewport(): HTMLDivElement | undefined {
  const exposed = scrollViewer.value?.scrollViewerRef
  if (exposed instanceof HTMLDivElement) return exposed
  return exposed?.value
}

function buildHeadingIndex() {
  const usedIds = new Map<string, number>()
  const indexedHeadings: DocumentHeading[] = []

  contentElement.value?.querySelectorAll<HTMLElement>('h1, h2, h3, h4').forEach((element, index) => {
    const text = element.textContent?.trim() || ''
    if (!text) return

    const baseId = slugify(text) || `section-${index + 1}`
    const duplicateCount = usedIds.get(baseId) || 0
    usedIds.set(baseId, duplicateCount + 1)
    const id = duplicateCount ? `${baseId}-${duplicateCount + 1}` : baseId

    element.id = id
    indexedHeadings.push({
      id,
      text,
      level: Number(element.tagName.slice(1))
    })
  })

  headings.value = indexedHeadings
  activeHeadingId.value = indexedHeadings.find(h => h.level > 1)?.id || indexedHeadings[0]?.id || ''
}

const tocMenuItems = computed<TocMenuItem[]>(() => {
  const items = tocHeadings.value
    .map(heading => ({ ...heading }))
  const roots: TocMenuItem[] = []
  const stack: { level: number; item: TocMenuItem }[] = []

  for (const heading of items) {
    const node: TocMenuItem = { value: heading.id, label: heading.text }
    while (stack.length && stack[stack.length - 1].level >= heading.level) {
      stack.pop()
    }
    if (stack.length) {
      const parent = stack[stack.length - 1].item
      parent.children = parent.children || []
      parent.children.push(node)
    } else {
      roots.push(node)
    }
    stack.push({ level: heading.level, item: node })
  }

  return roots
})

function updateActiveHeading() {
  scrollFrame = 0
  if (!tocHeadings.value.length) return

  const viewport = getScrollViewport()
  if (viewport && viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2) {
    activeHeadingId.value = tocHeadings.value[tocHeadings.value.length - 1].id
    return
  }
  const viewportTop = viewport?.getBoundingClientRect().top ?? 0
  const activationLine = viewportTop + 72
  let currentId = tocHeadings.value[0].id

  for (const heading of tocHeadings.value) {
    const element = document.getElementById(heading.id)
    if (!element || element.getBoundingClientRect().top > activationLine) break
    currentId = heading.id
  }

  activeHeadingId.value = currentId
}

function onDocumentScroll() {
  if (scrollFrame) return
  scrollFrame = requestAnimationFrame(updateActiveHeading)
}

function scrollToHeading(id: string, behavior: ScrollBehavior = 'smooth') {
  const element = document.getElementById(id)
  if (!element) return
  element.scrollIntoView({ behavior, block: 'start' })
  activeHeadingId.value = id
}

function scrollToHash(behavior: ScrollBehavior = 'smooth') {
  const id = decodeURIComponent(route.hash.slice(1))
  if (id) scrollToHeading(id, behavior)
}

function onTocItemInvoked(args: { InvokedItemContainer?: { value?: string } }) {
  const id = args?.InvokedItemContainer?.value
  if (!id) return
  scrollToHeading(id)
  if (route.hash !== `#${id}`) {
    void router.replace({ hash: `#${id}` })
  }
}

watch(() => route.params.id, async (id) => {
  if (!id) return
  const loader = mdModules[`/src/docs/${id}.md`]
  if (loader) {
    try {
      content.value = await loader() as string
      await nextTick()
      buildHeadingIndex()
      const viewport = getScrollViewport()
      if (route.hash) scrollToHash('auto')
      else if (viewport) viewport.scrollTop = 0
    } catch {
      content.value = `# ${t('doc.loadError')}`
      await nextTick()
      buildHeadingIndex()
    }
  } else {
    content.value = `# ${t('doc.notFound')}`
    await nextTick()
    buildHeadingIndex()
  }
}, { immediate: true })

watch(() => route.hash, async hash => {
  if (!hash) return
  await nextTick()
  scrollToHash()
})

onBeforeUnmount(() => {
  if (scrollFrame) cancelAnimationFrame(scrollFrame)
})
</script>

<style scoped>
.doc-view {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.doc-topbar {
  flex: 0 0 auto;
  height: 48px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 8px;
  gap: 4px;
  background: var(--app-bg);
  border-bottom: 1px solid var(--ctrl-border);
}

.doc-topbar-toggle {
  box-sizing: border-box;
  width: 40px;
  height: 36px;
  margin: 2px;
  padding: 0;
  border: 0;
  border-radius: var(--ControlCornerRadius, 4px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-primary);
  background: transparent;
  cursor: pointer;
  font-family: var(--SymbolThemeFontFamily, 'WinUIOnWebIcons');
  font-size: 16px;
  transition: background var(--fast-duration) var(--fast-out-slow-in), color var(--fast-duration) var(--fast-out-slow-in);
}

.doc-topbar-toggle:hover {
  background: var(--subtle-secondary);
}

.doc-topbar-toggle:active {
  background: var(--subtle-tertiary);
}

.doc-topbar-breadcrumb {
  flex: 1 1 auto;
  min-width: 0;
  align-self: stretch;
  display: flex;
  align-items: center;
}

.doc-view :deep(.win-nav-shell) {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
}

.doc-view :deep(.win-nav-content) {
  min-width: 0;
}

.doc-view :deep(.win-nav-content-inner) {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.doc-view :deep(.win-nav-page-header) {
  padding: 8px 16px 0;
}

.doc-scroll {
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
}

.doc-content {
  box-sizing: border-box;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  scroll-margin-top: 1rem;
}

.markdown-body :deep(h1) {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.markdown-body :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
  color: var(--text-primary);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--ctrl-border);
}

.markdown-body :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem 0;
  color: var(--text-primary);
}

.markdown-body :deep(h4) {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 1.25rem 0 0.5rem 0;
  color: var(--text-primary);
}

.markdown-body :deep(p) {
  margin: 0 0 1rem 0;
  line-height: 1.75;
  color: var(--text-primary);
}

.markdown-body :deep(strong) {
  font-weight: 600;
  color: var(--text-primary);
}

.markdown-body :deep(blockquote) {
  margin: 1rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid var(--accent-base);
  background: var(--subtle-secondary);
  border-radius: 0 4px 4px 0;
}

.markdown-body :deep(blockquote p) {
  margin: 0;
  color: var(--text-secondary);
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 1rem 0;
  padding-left: 2rem;
}

.markdown-body :deep(li) {
  margin: 0.25rem 0;
  line-height: 1.6;
}

.markdown-body :deep(hr) {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid var(--ctrl-border);
}

.markdown-body :deep(code) {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.875em;
  background: var(--subtle-secondary);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.markdown-body :deep(pre) {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--subtle-secondary);
  border-radius: 8px;
  overflow-x: auto;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

@media (max-width: 900px) {
  .doc-content {
    padding: 1rem;
  }
}
</style>
