<script lang="ts">
import type { VolumeInfoUI } from './VolumeInfoUI';
import Route from '../../Route.svelte';
import { onMount } from 'svelte';
import { volumeListInfos } from '../../stores/volumes';
import VolumeIcon from '../images/VolumeIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import VolumeActions from './VolumeActions.svelte';
import { VolumeUtils } from './volume-utils';
import VolumeDetailsSummary from '././VolumeDetailsSummary.svelte';
import VolumeDetailsInspect from './VolumeDetailsInspect.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import Tab from '../ui/Tab.svelte';

export let volumeName: string;
export let engineId: string;

let volume: VolumeInfoUI;
let detailsPage: DetailsPage;

onMount(() => {
  const volumeUtils = new VolumeUtils();
  // loading volume info
  return volumeListInfos.subscribe(volumes => {
    const allVolumes = volumes.map(volumeListInfo => volumeListInfo.Volumes).flat();
    const matchingVolume = allVolumes.find(volume => volume.Name === volumeName && volume.engineId === engineId);
    if (matchingVolume) {
      try {
        volume = volumeUtils.toVolumeInfoUI(matchingVolume);
      } catch (err) {
        console.error(err);
      }
    } else if (detailsPage) {
      // the volume has been deleted
      detailsPage.close();
    }
  });
});
</script>

{#if volume}
  <DetailsPage title="{volume.shortName}" subtitle="{volume.humanSize}" bind:this="{detailsPage}">
    <StatusIcon slot="icon" icon="{VolumeIcon}" size="{24}" status="{volume.status}" />
    <VolumeActions slot="actions" volume="{volume}" detailed="{true}" on:update="{() => (volume = volume)}" />
    <svelte:fragment slot="tabs">
      <Tab title="Summary" url="summary" />
      <Tab title="Inspect" url="inspect" />
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <VolumeDetailsSummary volume="{volume}" />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <VolumeDetailsInspect volume="{volume}" />
      </Route>
    </svelte:fragment>
  </DetailsPage>
{/if}
