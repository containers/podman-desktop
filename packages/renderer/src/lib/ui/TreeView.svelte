<script context="module" lang="ts">
const _expansionState = new Map<string, boolean>();
</script>

<script lang="ts">
import type { FileNode } from '../../../../main/src/plugin/file-tree';

export let tree: FileNode<any>;
export let margin = 0;
export let root = true;

$: label = tree.name;
$: children = tree.children;
$: file = tree.data;
$: colorClass = getColor(tree);

function getColor(tree: any) {
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

$: expanded = _expansionState.get(label) || false;
const toggleExpansion = () => {
  expanded = !expanded;
  _expansionState.set(label, expanded);
};
$: arrowDown = expanded;

function getHumanSize(size: number): string {
  let u = '';
  if (size > 1024) {
    size = Math.floor(size / 100) / 10;
    u = 'k';
  }
  if (size > 1024) {
    size = Math.floor(size / 100) / 10;
    u = 'M';
  }

  if (size > 99) {
    size = Math.floor(size);
  }
  return size + u;
}

function getLink(file: any): string {
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
  {#each children as [_, child]}
    <svelte:self root="{false}" margin="{margin + 2}" tree="{child}" />
  {/each}
{:else}
  <div class="font-mono">{tree.data && !tree.isRemoved ? tree.data.typeChar + tree.data.modeString : ''}</div>
  <div class="text-right">{tree.data && !tree.isRemoved ? tree.data.uid + ':' + tree.data.gid : ''}</div>
  <div class="text-right">{tree.data && !tree.isRemoved ? getHumanSize(tree.data.size) : ''}</div>
  {#if children.size || (file && file.type === 'Directory')}
    <button class="{`text-left ml-${margin} ${colorClass}`}" on:click="{toggleExpansion}">
      <span class="cursor-pointer inline-block mr-1" class:rotate-90="{arrowDown}">&gt;</span>
      {label}<span class="text-gray-900 text-sm">{getLink(tree.data)}</span>
    </button>
    {#if expanded}
      {#each children as [_, child]}
        <svelte:self root="{false}" margin="{margin + 2}" tree="{child}" />
      {/each}
    {/if}
  {:else}
    <div class="{`${colorClass}`}">
      <span class="{`pl-4 ml-${margin}`}"></span>
      {label}<span class="text-gray-900 text-sm">{getLink(tree.data)}</span>
    </div>
  {/if}
{/if}
