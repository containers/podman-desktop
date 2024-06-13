<script lang="ts">
import type { ManifestInspectInfo } from '@podman-desktop/api';
import { onMount } from 'svelte';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Subtitle from '/@/lib/details/DetailsSubtitle.svelte';
import Table from '/@/lib/details/DetailsTable.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

import { ImageUtils } from './image-utils';
import type { ImageInfoUI } from './ImageInfoUI';

export let image: ImageInfoUI;

let manifestDetails: ManifestInspectInfo | undefined;

const imageUtils = new ImageUtils();

onMount(async () => {
  if (image.isManifest) {
    try {
      manifestDetails = await window.inspectManifest(image.engineId, image.id);
    } catch (err) {
      console.error(err);
    }
  }
});
</script>

<Table>
  <tr>
    <Title>Details</Title>
  </tr>
  <tr>
    <Cell>Name</Cell>
    <Cell>{image.name}</Cell>
  </tr>
  <tr>
    <Cell>Tag</Cell>
    <Cell>{image.tag}</Cell>
  </tr>
  <tr>
    <Cell>ID</Cell>
    <Cell>{image.id}</Cell>
  </tr>
  <tr>
    <Cell>Size</Cell>
    <Cell>{image.humanSize}</Cell>
  </tr>
  <tr>
    <Cell>Age</Cell>
    <Cell>{image.age}</Cell>
  </tr>
  {#if manifestDetails && manifestDetails.manifests.length > 0}
    <tr>
      <Title>Manifest Details</Title>
    </tr>
    {#each manifestDetails.manifests as manifest}
      <tr>
        <Subtitle>{imageUtils.getShortId(manifest.digest)}</Subtitle>
      </tr>
      <tr>
        <Cell>Media Type</Cell>
        <Cell>{manifest.mediaType}</Cell>
      </tr>
      <tr>
        <Cell>Architecture</Cell>
        <Cell>{manifest.platform.architecture}</Cell>
      </tr>
      {#if manifest.platform.variant}
        <tr>
          <Cell>Variant</Cell>
          <Cell>{manifest.platform.variant}</Cell>
        </tr>
      {/if}
      <tr>
        <Cell>OS</Cell>
        <Cell>{manifest.platform.os}</Cell>
      </tr>
      <tr>
        <Cell>Size</Cell>
        <Cell>{imageUtils.getHumanSize(manifest.size)}</Cell>
      </tr>
      {#if manifest.urls}
        {#each manifest.urls as url}
          <tr>
            <Cell>URL</Cell>
            <Cell>{url}</Cell>
          </tr>
        {/each}
      {/if}
    {/each}
  {/if}
</Table>
