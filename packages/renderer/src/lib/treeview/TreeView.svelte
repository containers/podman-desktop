<script lang="ts">
import { onMount } from 'svelte';

import type { TreeViewDataItem } from './TreeViewDataItem';

import TreeViewItem from './TreeViewItem.svelte';

export let items: TreeViewDataItem[];
export let onSelect: (item: TreeViewDataItem) => void;
export let isExpanded: boolean = true;
</script>

<div class="pf-c-tree-view w-100">
  <ul class="pf-c-tree-view__list" role="tree">
    {#each items as item}
      <TreeViewItem item="{item}" isExpanded="{isExpanded}" onSelect="{item => onSelect(item)}" />
    {/each}
  </ul>
</div>
