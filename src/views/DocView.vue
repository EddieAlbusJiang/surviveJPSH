<template>
  <div class="doc-view">
    <WinBreadcrumbBar :Items="breadcrumbs" />
    <WinScrollViewer>
      <div class="doc-content markdown-body" v-html="renderedMarkdown"></div>
    </WinScrollViewer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import WinScrollViewer from '../components/WinScrollViewer.vue'
import WinBreadcrumbBar from '../components/WinBreadcrumbBar.vue'
import { parseMarkdown } from '../utils/markdown'
import { slugify } from '../utils/searchIndex'
import { createAppI18n } from '../i18n'

const route = useRoute()
const { t } = createAppI18n(localStorage.getItem('locale') || navigator.language)
const content = ref('')

const mdModules = import.meta.glob('/src/docs/*.md', {
  query: '?raw',
  import: 'default'
})

const renderedMarkdown = computed(() => parseMarkdown(content.value))

function addHeadingIds() {
  const container = document.querySelector('.doc-content')
  if (!container) return
  container.querySelectorAll('h1, h2, h3, h4').forEach(el => {
    const text = el.textContent?.trim() || ''
    if (text && !el.id) {
      el.id = slugify(text)
    }
  })
}

function scrollToHash() {
  const hash = route.hash.slice(1)
  if (hash) {
    nextTick(() => {
      const el = document.getElementById(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    })
  }
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
      const mod = await loader() as string
      content.value = mod
      await nextTick()
      addHeadingIds()
      scrollToHash()
    } catch {
      content.value = `# ${t('doc.loadError')}`
    }
  } else {
    content.value = `# ${t('doc.notFound')}`
  }
}, { immediate: true })

watch(() => route.hash, () => {
  if (route.hash) {
    addHeadingIds()
    scrollToHash()
  }
})
</script>

<style scoped>
.doc-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.doc-content {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
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

@media (max-width: 768px) {
  .doc-content {
    padding: 1rem;
  }
}
</style>
