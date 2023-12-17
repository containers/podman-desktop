<style>
ul {
  margin: 0;
  list-style: none;
  padding-left: 1.2rem;
  user-select: none;
}
.no-arrow {
  padding-left: 1rem;
}
.arrow {
  cursor: pointer;
  display: inline-block;
  /* transition: transform 200ms; */
}
.arrowDown {
  transform: rotate(90deg);
}
</style>

<script context="module">
const _expansionState = {};
</script>

<script lang="ts">
import type { fileNode } from '../../../../main/src/plugin/filetree';

//	import { slide } from 'svelte/transition'
export let tree: fileNode<any>;
$: label =
  (tree.data ? getModeString(tree.data.mode) : '') +
  ' ' +
  (tree.data ? getHumanSize(tree.data.size) : '') +
  ' ' +
  tree.name +
  getLink(tree.data);
$: children = tree.children;

$: expanded = _expansionState[label] || false;
const toggleExpansion = () => {
  expanded = _expansionState[label] = !expanded;
};
$: arrowDown = expanded;

function getModeString(mode: number): string {
  return (
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
  if (file.type === 'SymbolicLink' || file.type === 'Link') {
    return ' → ' + file.linkpath;
  }
  return '';
}
</script>

<ul>
  <!-- transition:slide -->
  <li>
    {#if children.size}
      <button on:click="{toggleExpansion}">
        <span class="arrow mr-1" class:arrowDown="{arrowDown}">&gt;</span>
        {label}
      </button>
      {#if expanded}
        {#each children as [_, child]}
          <svelte:self tree="{child}" />
        {/each}
      {/if}
    {:else}
      <span>
        <span class="no-arrow"></span>
        {label}
      </span>
    {/if}
  </li>
</ul>
