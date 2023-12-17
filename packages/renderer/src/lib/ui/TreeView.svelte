<style>
.no-arrow {
  padding-left: 1rem;
}
.arrow {
  cursor: pointer;
  display: inline-block;
}
.arrowDown {
  transform: rotate(90deg);
}
</style>

<script context="module" lang="ts">
const _expansionState = new Map<string, boolean>();
</script>

<script lang="ts">
import type { fileNode } from '../../../../main/src/plugin/filetree';

export let tree: fileNode<any>;
export let margin = 0;
export let root = true;

$: label = isRemoved(tree) ? tree.name.substring(4) : tree.name;
$: children = tree.children;
$: file = tree.data;
$: colorClass = getColor(tree.name, tree.data);

function getColor(name: string, data: any) {
  if (!data) {
    return '';
  }
  if (name.startsWith('.wh.')) {
    return 'text-red-500';
  }
  if (data.type === 'SymbolicLink') {
    return 'text-sky-300';
  }
  if (data.type === 'Directory') {
    return 'text-sky-500';
  }
  if (isExecutable(data.mode)) {
    return 'text-green-500';
  }
}

function isRemoved(data: any): boolean {
  return data?.name.startsWith('.wh.');
}

$: expanded = _expansionState.get(label) || false;
const toggleExpansion = () => {
  expanded = !expanded;
  _expansionState.set(label, expanded);
};
$: arrowDown = expanded;
$: console.log(tree);
function getModeString(type: string, mode: number): string {
  return (
    (type === 'Directory' ? 'd' : '-') +
    (mode & 0o400 ? 'r' : '-') +
    (mode & 0o200 ? 'w' : '-') +
    (mode & 0o100 ? 'x' : '-') +
    (mode & 0o040 ? 'r' : '-') +
    (mode & 0o020 ? 'w' : '-') +
    (mode & 0o010 ? 'x' : '-') +
    (mode & 0o004 ? 'r' : '-') +
    (mode & 0o002 ? 'w' : '-') +
    (mode & 0o001 ? 'x' : '-')
  );
}

function isExecutable(mode: number): boolean {
  return (mode & 0o111) !== 0;
}

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
  if (file.type === 'SymbolicLink') {
    return ' → ' + file.linkpath;
  }
  return '';
}
</script>

{#if root}
  {#each children as [_, child]}
    <svelte:self root="{false}" margin="{margin + 2}" tree="{child}" />
  {/each}
{:else}
  <div class="font-mono">{tree.data && !isRemoved(tree) ? getModeString(tree.data.type, tree.data.mode) : ''}</div>
  <div class="text-right">{tree.data && !isRemoved(tree) ? tree.data.uid + ':' + tree.data.gid : ''}</div>
  <div class="text-right">{tree.data && !isRemoved(tree) ? getHumanSize(tree.data.size) : ''}</div>
  {#if children.size || (file && file.type === 'Directory')}
    <button class="{`text-left ml-${margin} ${colorClass}`}" on:click="{toggleExpansion}">
      <span class="arrow mr-1" class:arrowDown="{arrowDown}">&gt;</span>
      {label}<span class="text-gray-900 text-sm">{getLink(tree.data)}</span>
    </button>
    {#if expanded}
      {#each children as [_, child]}
        <svelte:self root="{false}" margin="{margin + 2}" tree="{child}" />
      {/each}
    {/if}
  {:else}
    <div class="{`${colorClass}`}">
      <span class="{`no-arrow ml-${margin}`}"></span>
      {label}<span class="text-gray-900 text-sm">{getLink(tree.data)}</span>
    </div>
  {/if}
{/if}
