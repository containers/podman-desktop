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
import DetailsTab from '../ui/DetailsTab.svelte';

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
  <DetailsPage
    name="Volume Details"
    title="{volume.shortName}"
    subtitle="{volume.humanSize}"
    parentName="Volumes"
    parentURL="/volumes">
    <StatusIcon slot="icon" icon="{VolumeIcon}" status="{volume.inUse ? 'USED' : 'UNUSED'}" />
    <div slot="actions" class="flex justify-end">
      <VolumeActions volume="{volume}" detailed="{true}" />
    </div>
    <div slot="tabs" class="pf-c-tabs__list">
      <DetailsTab title="Summary" url="summary" />
      <DetailsTab title="Inspect" url="inspect" />
    </div>
    <span slot="content">
      <Route path="/summary" breadcrumb="Summary">
        <VolumeDetailsSummary volume="{volume}" />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect">
        <VolumeDetailsInspect volume="{volume}" />
      </Route>
    </span>
  </DetailsPage>
{/if}
