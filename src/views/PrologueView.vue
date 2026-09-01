<template>
  <WinScrollViewer class="prologue-scroll">
    <div class="prologue-content markdown-body" v-html="renderedMarkdown"></div>
  </WinScrollViewer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import WinScrollViewer from '../components/WinScrollViewer.vue'
import { parseMarkdown } from '../utils/markdown'
import prologueRaw from '../docs/prologue.md?raw'

const content = ref(prologueRaw)
const renderedMarkdown = computed(() => parseMarkdown(content.value))
</script>

<style scoped>
.prologue-scroll {
  height: 100%;
  min-height: 0;
}

.prologue-content {
  box-sizing: border-box;
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

.markdown-body :deep(p) {
  margin: 0 0 1rem 0;
  line-height: 1.75;
  color: var(--text-primary);
}

.markdown-body :deep(strong) {
  font-weight: 600;
  color: var(--text-primary);
}

@media (max-width: 900px) {
  .prologue-content {
    padding: 1rem;
  }
}
</style>
