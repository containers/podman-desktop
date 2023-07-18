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
onMount(() => {
  const volumeUtils = new VolumeUtils();
  // loading volume info
  volumeListInfos.subscribe(volumes => {
    const allVolumes = volumes.map(volumeListInfo => volumeListInfo.Volumes).flat();
    const matchingVolume = allVolumes.find(volume => volume.Name === volumeName && volume.engineId === engineId);
    if (matchingVolume) {
      try {
        volume = volumeUtils.toVolumeInfoUI(matchingVolume);
      } catch (err) {
        console.error(err);
      }
    }
  });
});
</script>

{#if volume}
  <DetailsPage title="{volume.shortName}" subtitle="{volume.humanSize}">
    <StatusIcon slot="icon" icon="{VolumeIcon}" status="{volume.inUse ? 'USED' : 'UNUSED'}" />
    <VolumeActions slot="actions" volume="{volume}" detailed="{true}" />
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
