<template>
  <div class="doc-view">
    <div class="doc-toolbar">
      <WinButton
        class="doc-toc-toggle"
        Style="{StaticResource SubtleButtonStyle}"
        :aria-label="tocToggleLabel"
        :aria-expanded="isTocOpen"
        aria-controls="doc-table-of-contents"
        v-bind="{ 'tooltipservice.tooltip': tocToggleLabel }"
        @Click="toggleToc">
        <span class="icon" aria-hidden="true">{{ IconGlyphs.Navigation }}</span>
      </WinButton>
      <WinBreadcrumbBar :ItemsSource="breadcrumbs" />
    </div>

    <div class="doc-body" :class="{ 'is-toc-open': isTocOpen, 'is-compact': isCompact }">
      <button
        v-if="isCompact && isTocOpen"
        class="doc-toc-scrim"
        type="button"
        :aria-label="t('doc.hideContents')"
        @click="closeToc"></button>

      <aside
        id="doc-table-of-contents"
        class="doc-toc"
        :aria-hidden="!isTocOpen"
        :inert="!isTocOpen ? '' : undefined">
        <div class="doc-toc-surface">
          <div class="doc-toc-header">{{ t('doc.contents') }}</div>
          <nav class="doc-toc-list" :aria-label="t('doc.contents')">
            <button
              v-for="heading in headings"
              :key="heading.id"
              type="button"
              class="doc-toc-item"
              :class="{ 'is-active': activeHeadingId === heading.id }"
              :style="{ '--heading-depth': String(heading.level - minimumHeadingLevel) }"
              :aria-current="activeHeadingId === heading.id ? 'location' : undefined"
              :title="heading.text"
              @click="navigateToHeading(heading.id)">
              <span>{{ heading.text }}</span>
            </button>
          </nav>
        </div>
      </aside>

      <WinScrollViewer ref="scrollViewer" class="doc-scroll" @ViewChanged="onDocumentScroll">
        <div ref="contentElement" class="doc-content markdown-body" v-html="renderedMarkdown"></div>
      </WinScrollViewer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WinScrollViewer from '../components/WinScrollViewer.vue'
import WinBreadcrumbBar from '../components/WinBreadcrumbBar.vue'
import WinButton from '../components/WinButton.vue'
import { parseMarkdown } from '../utils/markdown'
import { slugify } from '../utils/searchIndex'
import { IconGlyphs } from '../utils/iconGlyphs'
import { createAppI18n } from '../i18n'

interface DocumentHeading {
  id: string
  text: string
  level: number
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
const activeHeadingId = ref('')
const isTocOpen = ref(true)
const isCompact = ref(false)
let compactMediaQuery: MediaQueryList | undefined
let scrollFrame = 0

const mdModules = import.meta.glob('/src/docs/*.md', {
  query: '?raw',
  import: 'default'
})

const renderedMarkdown = computed(() => parseMarkdown(content.value))
const minimumHeadingLevel = computed(() => (
  headings.value.length ? Math.min(...headings.value.map(heading => heading.level)) : 1
))
const tocToggleLabel = computed(() => (
  isTocOpen.value ? t('doc.hideContents') : t('doc.showContents')
))

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
  activeHeadingId.value = indexedHeadings[0]?.id || ''
}

function updateActiveHeading() {
  scrollFrame = 0
  if (!headings.value.length) return

  const viewport = getScrollViewport()
  if (viewport && viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2) {
    activeHeadingId.value = headings.value[headings.value.length - 1].id
    return
  }
  const viewportTop = viewport?.getBoundingClientRect().top ?? 0
  const activationLine = viewportTop + 72
  let currentId = headings.value[0].id

  for (const heading of headings.value) {
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

function navigateToHeading(id: string) {
  scrollToHeading(id)
  if (route.hash !== `#${id}`) {
    void router.replace({ hash: `#${id}` })
  }
  if (isCompact.value) closeToc()
}

function toggleToc() {
  isTocOpen.value = !isTocOpen.value
}

function closeToc() {
  isTocOpen.value = false
}

function handleCompactChange(event: MediaQueryListEvent | MediaQueryList) {
  isCompact.value = event.matches
  isTocOpen.value = !event.matches
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isCompact.value && isTocOpen.value) closeToc()
}

const docTitleMap: Record<string, string> = {
  study: t('nav.study'),
  life: t('nav.life')
}

const breadcrumbs = computed(() => {
  const id = route.params.id as string
  return [
    { text: t('nav.home'), path: '/' },
    { text: docTitleMap[id] || id }
  ]
})

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

onMounted(() => {
  compactMediaQuery = window.matchMedia('(max-width: 900px)')
  handleCompactChange(compactMediaQuery)
  compactMediaQuery.addEventListener('change', handleCompactChange)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  compactMediaQuery?.removeEventListener('change', handleCompactChange)
  document.removeEventListener('keydown', handleKeydown)
  if (scrollFrame) cancelAnimationFrame(scrollFrame)
})
</script>

<style scoped>
.doc-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.doc-toolbar {
  min-height: 44px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid var(--ctrl-border);
  flex: 0 0 auto;
}

.doc-toolbar :deep(.win-breadcrumb-bar) {
  flex: 1 1 auto;
}

.doc-toc-toggle {
  width: 32px;
  min-width: 32px;
  height: 32px;
  min-height: 32px;
  padding: 0;
  flex: 0 0 32px;
}

.doc-toc-toggle .icon {
  font-size: 18px;
}

.doc-body {
  position: relative;
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  overflow: hidden;
}

.doc-toc {
  box-sizing: border-box;
  width: 0;
  min-width: 0;
  height: 100%;
  flex: 0 0 auto;
  overflow: hidden;
  border-right: 0 solid var(--ctrl-border);
  transition: width 200ms cubic-bezier(0, 0.35, 0.15, 1), border-width 200ms cubic-bezier(0, 0.35, 0.15, 1);
}

.doc-body.is-toc-open .doc-toc {
  width: 240px;
  border-right-width: 1px;
}

.doc-toc-surface {
  box-sizing: border-box;
  width: 240px;
  height: 100%;
  padding: 8px 4px;
  display: flex;
  flex-direction: column;
  background: var(--app-bg);
}

.doc-toc-header {
  min-height: 40px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.doc-toc-list {
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.doc-toc-item {
  position: relative;
  box-sizing: border-box;
  width: calc(100% - 8px);
  min-height: 36px;
  margin: 2px 4px;
  padding: 7px 10px 7px calc(10px + var(--heading-depth) * 14px);
  display: flex;
  align-items: center;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  cursor: pointer;
}

.doc-toc-item:hover {
  background: var(--subtle-secondary);
  color: var(--text-primary);
}

.doc-toc-item:active {
  background: var(--subtle-pressed);
}

.doc-toc-item.is-active {
  background: var(--subtle-secondary);
  color: var(--text-primary);
}

.doc-toc-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 2px;
  background: var(--accent-base);
}

.doc-toc-item span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.doc-toc-scrim {
  display: none;
}

@media (max-width: 900px) {
  .doc-toc {
    position: absolute;
    inset: 0 auto 0 0;
    z-index: 3;
    width: 240px;
    border-right: 1px solid var(--ctrl-border);
    border-radius: 0 8px 8px 0;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.16);
    transform: translateX(-100%);
    transition: transform 200ms cubic-bezier(0.1, 0.9, 0.2, 1);
  }

  .doc-body.is-toc-open .doc-toc {
    width: 240px;
    transform: translateX(0);
  }

  .doc-toc-surface {
    background: var(--AcrylicInAppFillColorDefaultBrush, var(--app-bg));
    -webkit-backdrop-filter: var(--flyout-backdrop);
    backdrop-filter: var(--flyout-backdrop);
  }

  .doc-toc-scrim {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: rgba(0, 0, 0, 0.18);
  }

  .doc-content {
    padding: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .doc-toc {
    transition-duration: 0ms;
  }
}
</style>
