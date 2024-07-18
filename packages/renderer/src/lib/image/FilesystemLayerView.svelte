<script context="module" lang="ts">
const expansionState = new Map<string, boolean>();
</script>

<script lang="ts">
import type { ImageFile, ImageFileSymlink } from '@podman-desktop/api';

import type { FilesystemNode } from './filesystem-tree';
import { ImageUtils } from './image-utils';
import { isExec, modeString } from './imageDetailsFiles';

export let tree: FilesystemNode<ImageFile>;
export let margin = 0;
export let root = true;
export let layerMode = false;

$: label = tree.name;
$: children = tree?.children;
$: file = tree?.data;
$: colorClass = getColor(tree);
function getColor(tree: FilesystemNode<ImageFile>) {
  if (tree.hidden) {
    return 'text-red-500';
  }
  if (!tree.data) {
    if (tree.children.size) {
      return 'text-sky-500';
    }
    return '';
  }
  if (tree.data.type === 'symlink') {
    return 'text-sky-300';
  }
  if (tree.data.type === 'directory') {
    return 'text-sky-500';
  }
  if (isExec(tree.data)) {
    return 'text-green-500';
  }
  return '';
}
$: expanded = expansionState.get(label) ?? false;
const toggleExpansion = () => {
  expanded = !expanded;
  expansionState.set(label, expanded);
};
$: arrowDown = expanded;
function getLink(file: ImageFile | undefined): string {
  if (!file) {
    return '';
  }
  if (file.type === 'symlink') {
    return ' → ' + (file as ImageFileSymlink).linkPath;
  }
  return '';
}
</script>

{#if layerMode || !tree.hidden}
  {#if root}
    {#if children}
      {#each children as [_, child]}
        <svelte:self root={false} margin={margin + 2} tree={child} layerMode={layerMode} />
      {/each}
    {/if}
  {:else}
    <div class="font-mono">{tree.data && !tree.hidden ? modeString(tree.data) : ''}</div>
    <div class="text-right">{tree.data && !tree.hidden ? tree.data.uid + ':' + tree.data.gid : ''}</div>
    <span class="text-right">{!tree.hidden ? new ImageUtils().getHumanSize(tree.size) : ''}</span>
    {#if children?.size || (file && file.type === 'directory')}
      <button class={`text-left ml-${margin} ${colorClass}`} on:click={toggleExpansion}>
        <span class="cursor-pointer inline-block mr-1" class:rotate-90={arrowDown}>&gt;</span>
        {label}<span class="text-gray-900">{getLink(tree?.data)}</span>
      </button>
      {#if expanded && children}
        {#each children as [_, child]}
          <svelte:self root={false} margin={margin + 2} tree={child} layerMode={layerMode} />
        {/each}
      {/if}
    {:else}
      <div class={`${colorClass}`}>
        <span class={`pl-4 ml-${margin}`}></span>
        {label}<span class="text-gray-900">{getLink(tree?.data)}</span>
      </div>
    {/if}
  {/if}
{/if}
