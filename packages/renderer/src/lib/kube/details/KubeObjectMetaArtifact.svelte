<script lang="ts">
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import type { V1ObjectMeta } from '@kubernetes/client-node';
import Fa from 'svelte-fa';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

import { internalKubernetesKeys } from './utils';

export let artifact: V1ObjectMeta | undefined;

if (artifact?.creationTimestamp) {
  artifact.creationTimestamp = new Date(artifact.creationTimestamp);
}

let internalLabelsDropdownOpen: boolean = false;
let internalAnnotationsDropdownOpen: boolean = false;

let labels: [string, string][] = [];
let internalLabels: [string, string][] = [];
let annotations: [string, string][] = [];
let internalAnnotations: [string, string][] = [];

// Sort labels out to internal and external
if (artifact?.labels) {
  Object.entries(artifact.labels).forEach(([key, value]) => {
    if (internalKubernetesKeys.includes(key)) {
      internalLabels.push([key, value]);
    } else {
      labels.push([key, value]);
    }
  });
}

// Sort annotationsout to internal and external
if (artifact?.annotations) {
  Object.entries(artifact.annotations).forEach(([key, value]) => {
    if (internalKubernetesKeys.includes(key)) {
      internalAnnotations.push([key, value]);
    } else {
      annotations.push([key, value]);
    }
  });
}
</script>

{#if artifact}
  <tr>
    <Title>Metadata</Title>
  </tr>
  <tr>
    <Cell>Name</Cell>
    <Cell>{artifact?.name}</Cell>
  </tr>
  {#if artifact?.namespace}
    <tr>
      <Cell>Namespace</Cell>
      <Cell>{artifact?.namespace}</Cell>
    </tr>
  {/if}
  <tr>
    <Cell>Created</Cell>
    <Cell>{artifact?.creationTimestamp}</Cell>
  </tr>
  {#if labels.length > 0}
    <tr>
      <Cell>Labels</Cell>
      <Cell>
        {#each labels as [key, value]}
          {key}: {value}
          <br />
        {/each}
      </Cell>
    </tr>
  {/if}
  {#if internalLabels.length > 0}
    <tr>
      <Cell
        style="cursor-pointer flex items-center"
        onClick={() => (internalLabelsDropdownOpen = !internalLabelsDropdownOpen)}>
        Internal Labels
        <Fa class="ml-1" size="0.9x" icon={internalLabelsDropdownOpen ? faChevronDown : faChevronRight} />
      </Cell>
      <Cell>
        {#if internalLabelsDropdownOpen}
          {#each internalLabels as [key, value]}
            {key}: {value}
            <br />
          {/each}
        {:else}
          ...
        {/if}
      </Cell>
    </tr>
  {/if}

  {#if annotations.length > 0}
    <tr>
      <Cell>Annotations</Cell>
      <Cell>
        {#each annotations as [key, value]}
          {key}: {value}
          <br />
        {/each}
      </Cell></tr>
  {/if}

  {#if internalAnnotations.length > 0}
    <tr>
      <Cell
        style="cursor-pointer flex items-center"
        onClick={() => (internalAnnotationsDropdownOpen = !internalAnnotationsDropdownOpen)}>
        Internal Annotations
        <Fa class="ml-1" size="0.9x" icon={internalAnnotationsDropdownOpen ? faChevronDown : faChevronRight} />
      </Cell>
      <Cell>
        {#if internalAnnotationsDropdownOpen}
          {#each internalAnnotations as [key, value]}
            {key}: {value}
            <br />
          {/each}
        {:else}
          ...
        {/if}
      </Cell>
    </tr>
  {/if}
{/if}
