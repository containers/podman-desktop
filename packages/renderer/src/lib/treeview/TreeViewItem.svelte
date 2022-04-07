<script lang="ts">
import type { TreeViewDataItem } from './TreeViewDataItem';

export let open: boolean = true;
export let item: TreeViewDataItem;
export let isExpanded: boolean = true;
export let onSelect: (item: TreeViewDataItem) => void;

function toggleOpen() {
  open = !open;
}
</script>

<li class="pf-c-tree-view__list-item" class:pf-m-expanded="{open}" role="treeitem" aria-expanded="{open}" tabindex="0">
  <div
    on:click="{() => {
      onSelect(item);
      toggleOpen();
    }}"
    class="pf-c-tree-view__content">
    <button class="pf-c-tree-view__node">
      <div class="pf-c-tree-view__node-container">
        {#if item.children.length > 0}
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
        {/if}
        <span class="pf-c-tree-view__node-text text-base capitalize">{item.name}</span>
      </div>
    </button>
  </div>
  {#if open === true}
    <ul class="pf-c-tree-view__list" role="group">
      {#each item.children as child}
        <svelte:self item="{child}" onSelect="{onSelect}" />
      {/each}
    </ul>
  {/if}
</li>
