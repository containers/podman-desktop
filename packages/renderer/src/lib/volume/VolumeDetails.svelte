<script lang="ts">
import type { VolumeInfoUI } from './VolumeInfoUI';
import { Route } from 'tinro';
import { onMount } from 'svelte';
import { volumeListInfos } from '../../stores/volumes';
import VolumeActions from './VolumeActions.svelte';
import { VolumeUtils } from './volume-utils';
import VolumeDetailsSummary from '././VolumeDetailsSummary.svelte';
import VolumeDetailsInspect from './VolumeDetailsInspect.svelte';

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
  <Route path="/*" let:meta>
    <div class="w-full h-full">
      <div class="flex h-full flex-col">
        <div class="flex w-full flex-row">
          <div class="w-full  px-5 pt-5">
            <div class="flex flew-row items-center">
              <a class="text-violet-400 text-base hover:no-underline" href="/volumes" title="Go back to volumes list"
                >Volumes</a>
              <div class="text-xl mx-2 text-gray-400">></div>
              <div class="text-sm font-extralight text-gray-400">Volume Details</div>
            </div>
            <div class="text-lg flex flex-row items-center">
              <p class="mr-2">{volume.name}</p>
            </div>
            <div class="mr-2 pb-4 text-small text-gray-500">{volume.humanSize}</div>

            <section class="pf-c-page__main-tabs pf-m-limit-width">
              <div class="pf-c-page__main-body">
                <div class="pf-c-tabs pf-m-page-insets" id="open-tabs-example-tabs-list">
                  <ul class="pf-c-tabs__list">
                    <li
                      class="pf-c-tabs__item"
                      class:pf-m-current="{meta.url ===
                        `/volumes/${encodeURI(volume.name)}/${encodeURI(volume.engineId)}/summary`}">
                      <a
                        href="/volumes/${encodeURI(volume.name)}/${encodeURI(volume.engineId)}/summary"
                        class="pf-c-tabs__link"
                        aria-controls="open-tabs-example-tabs-list-details-panel"
                        id="open-tabs-example-tabs-list-details-link">
                        <span class="pf-c-tabs__item-text">Summary</span>
                      </a>
                    </li>
                    <li
                      class="pf-c-tabs__item"
                      class:pf-m-current="{meta.url ===
                        `/volumes/${encodeURI(volume.name)}/${encodeURI(volume.engineId)}/inspect`}">
                      <a
                        href="/volumes/${encodeURI(volume.name)}/${encodeURI(volume.engineId)}/inspect"
                        class="pf-c-tabs__link"
                        aria-controls="open-tabs-example-tabs-list-yaml-panel"
                        id="open-tabs-example-tabs-list-yaml-link">
                        <span class="pf-c-tabs__item-text">Inspect</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
          <div class="flex flex-row-reverse w-full  px-5 pt-5">
            <div class="flex h-10">
              <VolumeActions volume="{volume}" />
            </div>
          </div>
          <a href="/containers" title="Close Details" class="mt-2 mr-2 text-gray-500"
            ><i class="fas fa-times" aria-hidden="true"></i></a>
        </div>
        <Route path="/summary">
          <VolumeDetailsSummary volume="{volume}" />
        </Route>
        <Route path="/inspect">
          <VolumeDetailsInspect volume="{volume}" />
        </Route>
      </div>
    </div>
  </Route>
{/if}
