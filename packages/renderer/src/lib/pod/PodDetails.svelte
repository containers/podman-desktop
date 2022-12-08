<script lang="ts">
import { Route } from 'tinro';
import { onDestroy, onMount } from 'svelte';
import type { PodInfoUI } from './PodInfoUI';
import { PodUtils } from './pod-utils';
import type { Unsubscriber } from 'svelte/store';
import { podsInfos } from '../../stores/pods';
import PodActions from './PodActions.svelte';
import PodDetailsSummary from './PodDetailsSummary.svelte';
import PodDetailsInspect from './PodDetailsInspect.svelte';
import PodDetailsKube from './PodDetailsKube.svelte';

export let podName: string;
export let engineId: string;

let pod: PodInfoUI;
let podUnsubscribe: Unsubscriber;

onMount(() => {
  const podUtils = new PodUtils();
  // loading volume info
  podUnsubscribe = podsInfos.subscribe(pods => {
    const matchingPod = pods.find(podInPods => podInPods.Name === podName && podInPods.engineId === engineId);
    if (matchingPod) {
      try {
        pod = podUtils.getPodInfoUI(matchingPod);
      } catch (err) {
        console.error(err);
      }
    }
  });
});

onDestroy(() => {
  if (podUnsubscribe) {
    podUnsubscribe();
  }
});
</script>

{#if pod}
  <Route path="/*" let:meta>
    <div class="w-full h-full">
      <div class="flex h-full flex-col">
        <div class="flex w-full flex-row">
          <div class="w-full  px-5 pt-5">
            <div class="flex flew-row items-center">
              <a class="text-violet-400 text-base hover:no-underline" href="/pods" title="Go back to pods list">Pods</a>
              <div class="text-xl mx-2 text-gray-400">></div>
              <div class="text-sm font-extralight text-gray-400">Pod Details</div>
            </div>
            <div class="text-lg flex flex-row items-center">
              <p class="mr-2">{pod.name}</p>
            </div>
            <div class="mr-2 pb-4 text-small text-gray-500">{pod.id}</div>

            <section class="pf-c-page__main-tabs pf-m-limit-width">
              <div class="pf-c-page__main-body">
                <div class="pf-c-tabs pf-m-page-insets" id="open-tabs-example-tabs-list">
                  <ul class="pf-c-tabs__list">
                    <li
                      class="pf-c-tabs__item"
                      class:pf-m-current="{meta.url ===
                        `/pods/${encodeURI(pod.name)}/${encodeURI(pod.engineId)}/summary`}">
                      <a
                        href="/pods/${encodeURI(pod.name)}/${encodeURI(pod.engineId)}/summary"
                        class="pf-c-tabs__link"
                        aria-controls="open-tabs-example-tabs-list-details-panel"
                        id="open-tabs-example-tabs-list-details-link">
                        <span class="pf-c-tabs__item-text">Summary</span>
                      </a>
                    </li>
                    <li
                      class="pf-c-tabs__item"
                      class:pf-m-current="{meta.url ===
                        `/pods/${encodeURI(pod.name)}/${encodeURI(pod.engineId)}/inspect`}">
                      <a
                        href="/pods/${encodeURI(pod.name)}/${encodeURI(pod.engineId)}/inspect"
                        class="pf-c-tabs__link"
                        aria-controls="open-tabs-example-tabs-list-yaml-panel"
                        id="open-tabs-example-tabs-list-yaml-link">
                        <span class="pf-c-tabs__item-text">Inspect</span>
                      </a>
                    </li>
                    <li
                      class="pf-c-tabs__item"
                      class:pf-m-current="{meta.url ===
                        `/pods/${encodeURI(pod.name)}/${encodeURI(pod.engineId)}/kube`}">
                      <a
                        href="/pods/${encodeURI(pod.name)}/${encodeURI(pod.engineId)}/kube"
                        class="pf-c-tabs__link"
                        aria-controls="open-tabs-example-tabs-list-yaml-panel"
                        id="open-tabs-example-tabs-list-yaml-link">
                        <span class="pf-c-tabs__item-text">Kube</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
          <div class="flex flex-col w-full px-5 pt-5">
            <div class="flex justify-end">
              <PodActions pod="{pod}" detailed="{true}" />
            </div>
          </div>
          <a href="/containers" title="Close Details" class="mt-2 mr-2 text-gray-500"
            ><i class="fas fa-times" aria-hidden="true"></i></a>
        </div>
        <Route path="/summary">
          <PodDetailsSummary pod="{pod}" />
        </Route>
        <Route path="/inspect">
          <PodDetailsInspect pod="{pod}" />
        </Route>
        <Route path="/kube">
          <PodDetailsKube pod="{pod}" />
        </Route>
      </div>
    </div>
  </Route>
{/if}
