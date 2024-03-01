<script context="module" lang="ts">
const expansionState = new Map<string, boolean>();
</script>

<script lang="ts">
import type { FileNode } from '../../../../main/src/plugin/file-tree';
import type { File } from '../../../../main/src/plugin/image-layers';
import { ImageUtils } from '../image/image-utils';

export let tree: FileNode<File>;
export let margin = 0;
export let root = true;

$: label = tree.name;
$: children = tree.children;
$: file = tree.data;
$: colorClass = getColor(tree);

function getColor(tree: FileNode<File>) {
  if (!tree.data) {
    return '';
  }
  if (tree.isRemoved) {
    return 'text-red-500';
  }
  if (tree.data.isLink) {
    return 'text-sky-300';
  }
  if (tree.data.isDir) {
    return 'text-sky-500';
  }
  if (tree.data.isExec) {
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

function getLink(file: File | undefined): string {
  if (!file) {
    return '';
  }
  if (file.isLink) {
    return ' → ' + file.linkTarget;
  }
  return '';
}
</script>

{#if root}
  {#if children}
    {#each children as [_, child]}
      <svelte:self root="{false}" margin="{margin + 2}" tree="{child}" />
    {/each}
  {/if}
{:else}
  <div class="font-mono">{tree.data && !tree.isRemoved ? tree.data.typeChar + tree.data.modeString : ''}</div>
  <div class="text-right">{tree.data && !tree.isRemoved ? tree.data.uid + ':' + tree.data.gid : ''}</div>
  <span class="text-right">{!tree.isRemoved ? new ImageUtils().getHumanSize(tree.size) : ''}</span>
  {#if children.size || (file && file.isDir)}
    <button class="{`text-left ml-${margin} ${colorClass}`}" on:click="{toggleExpansion}">
      <span class="cursor-pointer inline-block mr-1" class:rotate-90="{arrowDown}">&gt;</span>
      {label}<span class="text-gray-900">{getLink(tree.data)}</span>
    </button>
    {#if expanded && children}
      {#each children as [_, child]}
        <svelte:self root="{false}" margin="{margin + 2}" tree="{child}" />
      {/each}
    {/if}
  {:else}
    <div class="{`${colorClass}`}">
      <span class="{`pl-4 ml-${margin}`}"></span>
      {label}<span class="text-gray-900">{getLink(tree.data)}</span>
    </div>
  {/if}
{/if}
