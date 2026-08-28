import type { ComputedRef, InjectionKey } from 'vue';

export interface WinNavigationNormalizedItem {
  value: string;
  tag: string;
  label: string;
  icon: string;
  type: string;
  children: WinNavigationNormalizedItem[] | null;
  isEnabled: boolean;
  selectsOnInvoked: boolean;
  source: unknown;
}

export interface WinNavigationItemContext {
  selectedValue: ComputedRef<string>;
  groupExpanded: Record<string, boolean>;
  groupHeights: Record<string, number>;
  groupChevrons: Record<string, string>;
  isPaneGroupChildrenVisible: ComputedRef<boolean>;
  itemToolTipAttrs: (item: WinNavigationNormalizedItem) => Record<string, unknown>;
  groupChevronClass: (value: string) => string;
  isDescendantOfGroup: (groupItem: WinNavigationNormalizedItem) => boolean;
  onItemClick: (item: WinNavigationNormalizedItem, isChild?: boolean) => void;
  onGroupHeaderClick: (item: WinNavigationNormalizedItem, invokeItem?: boolean) => void;
  onGroupChevronClick: (item: WinNavigationNormalizedItem) => void;
  setItemRef: (value: string, el: unknown) => void;
  setChildrenRef: (value: string, el: unknown) => void;
}

export const winNavigationItemContextKey: InjectionKey<WinNavigationItemContext> = Symbol('winNavigationItemContext');
