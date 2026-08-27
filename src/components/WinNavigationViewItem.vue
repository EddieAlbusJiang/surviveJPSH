<template>
  <div v-if="item.type === 'Header'" class="win-nav-item-header">
    <WinTextBlock :Text="item.label" />
  </div>
  <div v-else-if="item.type === 'Separator'" class="win-nav-item-separator"></div>
  <div v-else-if="!item.children" class="win-nav-item" :class="itemClasses" role="button"
    :style="itemIndentStyle"
    :aria-disabled="!item.isEnabled || undefined"
    v-bind="ctx.itemToolTipAttrs(item)"
    @click="onItemClick(item)"
    :ref="el => ctx.setItemRef(item.value, el)">
    <span v-if="item.icon" class="icon">{{ item.icon }}</span>
    <WinTextBlock class="label" :Text="item.label" />
    <WinInfoBadge v-if="item.infoBadge" class="win-nav-infobadge" v-bind="item.infoBadge" />
  </div>
  <div v-else class="win-nav-group" :class="groupClasses">
    <div class="win-nav-item win-nav-group-header" :class="headerClasses" role="button"
      :style="itemIndentStyle"
      :aria-disabled="!item.isEnabled || undefined"
      v-bind="ctx.itemToolTipAttrs(item)"
      @click="onGroupHeaderClick(item)"
      :ref="el => ctx.setItemRef(item.value, el)">
      <span v-if="item.icon" class="icon">{{ item.icon }}</span>
      <WinTextBlock class="label" :Text="item.label" />
      <WinInfoBadge v-if="item.infoBadge" class="win-nav-infobadge" v-bind="item.infoBadge" />
      <span class="icon win-nav-group-chevron" :class="ctx.groupChevronClass(item.value)" @click.stop="onGroupChevronClick(item)">&#xF2A6;</span>
    </div>
    <div
      class="win-nav-group-children"
      :style="childrenStyle"
      :aria-hidden="ctx.isPaneGroupChildrenVisible.value ? undefined : 'true'"
      :inert="ctx.isPaneGroupChildrenVisible.value ? undefined : ''">
      <div class="win-nav-group-children-inner" :ref="el => ctx.setChildrenRef(item.value, el)">
        <WinNavigationViewItem
          v-for="child in item.children"
          :key="child.value"
          :item="child"
          :depth="depth + 1" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import WinTextBlock from './WinTextBlock.vue';
import WinInfoBadge from './WinInfoBadge.vue';
import {
  winNavigationItemContextKey,
  type WinNavigationItemContext,
  type WinNavigationNormalizedItem
} from './winNavigationContext';

const props = defineProps<{
  item: WinNavigationNormalizedItem;
  depth?: number;
}>();

const ctx = inject(winNavigationItemContextKey) as WinNavigationItemContext;

const isChild = computed(() => (props.depth ?? 0) > 0);

const baseClasses = computed(() => ({
  'is-selected': ctx.selectedValue.value === props.item.value,
  'is-disabled': !props.item.isEnabled
}));

const itemClasses = computed(() => ({
  ...baseClasses.value,
  'win-nav-group-child': isChild.value
}));

const groupClasses = computed(() => ({
  'is-expanded': ctx.groupExpanded[props.item.value] && ctx.isPaneGroupChildrenVisible.value,
  'is-child-selected': ctx.isDescendantOfGroup(props.item)
}));

const headerClasses = computed(() => ({
  ...baseClasses.value,
  'win-nav-group-child': isChild.value,
  'win-nav-group-header': true,
  'is-selected': props.item.selectsOnInvoked !== false && ctx.selectedValue.value === props.item.value
}));

const childrenStyle = computed(() => ({
  height: ctx.groupExpanded[props.item.value] && ctx.isPaneGroupChildrenVisible.value
    ? (ctx.groupHeights[props.item.value] || 0) + 'px'
    : '0px'
}));

const itemIndentStyle = computed(() => {
  const depth = props.depth ?? 0;
  if (depth <= 0) return {};
  return { paddingLeft: `${44 + (depth - 1) * 16}px` };
});

function onItemClick(item: WinNavigationNormalizedItem) {
  ctx.onItemClick(item, isChild.value);
}

function onGroupHeaderClick(item: WinNavigationNormalizedItem) {
  ctx.onGroupHeaderClick(item);
}

function onGroupChevronClick(item: WinNavigationNormalizedItem) {
  ctx.onGroupChevronClick(item);
}
</script>
