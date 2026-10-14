<script lang="ts">
import type { FilesystemNode } from '@desktop-framework/api';
import type { ImageFile, ImageFileSymlink } from '@desktop-framework/extension-api';
import { SvelteMap } from 'svelte/reactivity';

import FilesystemLayerView from './FilesystemLayerView.svelte';
import { ImageUtils } from './image-utils';

const expansionState = new SvelteMap<string, boolean>();

interface Props {
  tree: FilesystemNode<ImageFile>;
  margin?: number;
  root?: boolean;
  layerMode?: boolean;
}

let { tree, margin = 0, root = true, layerMode = false }: Props = $props();

function getColor(tree: FilesystemNode<ImageFile>): string {
  if (tree.hidden) {
    return 'text-[var(--pd-files-hidden)]';
  }
  if (!tree.data) {
    if (tree.children.size) {
      return 'text-[var(--pd-files-directory)]';
    }
    return '';
  }
  if (tree.data.type === 'symlink') {
    return 'text-[var(--pd-files-symlink)]';
  }
  if (tree.data.type === 'directory') {
    return 'text-[var(--pd-files-directory)]';
  }
  if (isExec(tree.data)) {
    return 'text-[var(--pd-files-executable)]';
  }
  return '';
}

let label = $derived(tree.name);

let expanded = $derived(expansionState.get(label) ?? false);

const toggleExpansion = (): void => {
  expanded = !expanded;
  expansionState.set(label, expanded);
};
function getLink(file: ImageFile | undefined): string {
  if (!file) {
    return '';
  }
  if (file.type === 'symlink') {
    return ' → ' + (file as ImageFileSymlink).linkPath;
  }
  return '';
}

function isExec(data: ImageFile): boolean {
  return (data.mode & 0o111) !== 0;
}

// SUID, SGID, and sticky bit: https://www.redhat.com/sysadmin/suid-sgid-sticky-bit
function modeString(data: ImageFile): string {
  return (
    (data.type === 'directory' ? 'd' : '-') +
    (data.mode & 0o400 ? 'r' : '-') +
    (data.mode & 0o200 ? 'w' : '-') +
    (data.mode & 0o4000 ? (data.mode & 0o100 ? 's' : 'S') : data.mode & 0o100 ? 'x' : '-') +
    (data.mode & 0o040 ? 'r' : '-') +
    (data.mode & 0o020 ? 'w' : '-') +
    (data.mode & 0o2000 ? (data.mode & 0o010 ? 's' : 'S') : data.mode & 0o010 ? 'x' : '-') +
    (data.mode & 0o004 ? 'r' : '-') +
    (data.mode & 0o002 ? 'w' : '-') +
    (data.mode & 0o1000 ? 't' : data.mode & 0o001 ? 'x' : '-')
  );
}
let children = $derived(tree?.children);
let file = $derived(tree?.data);
let colorClass = $derived(getColor(tree));
let arrowDown = $derived(expanded);
</script>

{#if layerMode || !tree.hidden}
  {#if root}
    {#if children}
      {#each children as [key, child] (key)}
        <FilesystemLayerView root={false} margin={margin + 0.5} tree={child} layerMode={layerMode} />
      {/each}
    {/if}
  {:else}
    <div class="font-mono">{tree.data && !tree.hidden ? modeString(tree.data) : ''}</div>
    <div class="text-right">{tree.data && !tree.hidden ? tree.data.uid + ':' + tree.data.gid : ''}</div>
    <span class="text-right">{!tree.hidden ? new ImageUtils().getHumanSize(tree.size) : ''}</span>
    {#if children?.size || (file?.type === 'directory')}
      <button style="margin-left: {margin}rem" class={`text-left ${colorClass}`} onclick={toggleExpansion}>
        <span class="cursor-pointer inline-block mr-1" class:rotate-90={arrowDown}>&gt;</span>
        {label}<span class="text-[var(--pd-content-text)] opacity-70">{getLink(tree?.data)}</span>
      </button>
      {#if expanded && children}
        {#each children as [key, child] (key)}
          <FilesystemLayerView root={false} margin={margin + 0.5} tree={child} layerMode={layerMode} />
        {/each}
      {/if}
    {:else}
      <div class={`${colorClass}`}>
        <span style="margin-left: {margin}rem" class="pl-4"></span>
        {label}<span class="text-[var(--pd-content-text)] opacity-70">{getLink(tree?.data)}</span>
      </div>
    {/if}
  {/if}
{/if}
