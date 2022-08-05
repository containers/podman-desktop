<script lang="ts">
import type { ContainerInfoUI } from './container/ContainerInfoUI';
import { Route } from 'tinro';
import ContainerIcon from './ContainerIcon.svelte';
import 'xterm/css/xterm.css';
import ContainerDetailsTerminal from './ContainerDetailsTerminal.svelte';
import ContainerDetailsLogs from './ContainerDetailsLogs.svelte';
import ContainerActions from './container/ContainerActions.svelte';
import { onMount } from 'svelte';
import { containersInfos } from '../stores/containers';
import { ContainerUtils } from './container/container-utils';
import ContainerDetailsInspect from './ContainerDetailsInspect.svelte';

export let containerID: string;

let container: ContainerInfoUI;
onMount(() => {
  const containerUtils = new ContainerUtils();
  // loading container info
  containersInfos.subscribe(containers => {
    const matchingContainer = containers.find(c => c.Id === containerID);
    if (matchingContainer) {
      container = containerUtils.getContainerInfoUI(matchingContainer);
    }
  });
});
</script>

{#if container}
  <Route path="/*" let:meta>
    <div class="w-full h-full">
      <div class="flex h-full flex-col">
        <div class="flex w-full flex-row">
          <div class="w-full  px-5 pt-5">
            <div class="flex flew-row items-center">
              <a
                class="text-violet-400 text-base hover:no-underline"
                href="/containers"
                title="Go back to containers list">Containers</a>
              <div class="text-xl mx-2 text-gray-400">></div>
              <div class="text-sm font-extralight text-gray-400">Container Details</div>
            </div>
            <div class="pb-4 text-lg flex flex-row items-center">
              <ContainerIcon state="{container.state}" />
              <p class="mx-2">{container.name}</p>
              <div class="text-base text-violet-400">{container.image}</div>
            </div>
            <section class="pf-c-page__main-tabs pf-m-limit-width">
              <div class="pf-c-page__main-body">
                <div class="pf-c-tabs pf-m-page-insets" id="open-tabs-example-tabs-list">
                  <ul class="pf-c-tabs__list">
                    <li class="pf-c-tabs__item" class:pf-m-current="{meta.url === `/containers/${container.id}/logs`}">
                      <a
                        href="/containers/{container.id}/logs"
                        class="pf-c-tabs__link"
                        aria-controls="open-tabs-example-tabs-list-details-panel"
                        id="open-tabs-example-tabs-list-details-link">
                        <span class="pf-c-tabs__item-text">Logs</span>
                      </a>
                    </li>

                    <li class="pf-c-tabs__item" class:pf-m-current="{meta.url === '/containers/inspect'}">
                      <a
                        href="/containers/{container.id}/inspect"
                        class="pf-c-tabs__link"
                        aria-controls="open-tabs-example-tabs-list-yaml-panel"
                        id="open-tabs-example-tabs-list-yaml-link">
                        <span class="pf-c-tabs__item-text">Inspect</span>
                      </a>
                    </li>

                    <li
                      class="pf-c-tabs__item"
                      class:pf-m-current="{meta.url === `/containers/${container.id}/terminal`}">
                      <a
                        href="/containers/{container.id}/terminal"
                        class="pf-c-tabs__link"
                        aria-controls="open-tabs-example-tabs-list-environment-panel"
                        id="open-tabs-example-tabs-list-environment-link">
                        <span class="pf-c-tabs__item-text">Terminal</span>
                      </a>
                    </li>
                    <li
                      class="pf-c-tabs__item"
                      class:pf-m-current="{meta.url === `/containers/${container.id}/details`}">
                      <a
                        href="/containers/{container.id}/details"
                        class="pf-c-tabs__link"
                        aria-controls="open-tabs-example-tabs-list-details-panel"
                        id="open-tabs-example-tabs-list-details-link">
                        <span class="pf-c-tabs__item-text">Details</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
          <div class="flex flex-row-reverse w-full  px-5 pt-5">
            <div class="flex h-10">
              <ContainerActions container="{container}" backgroundColor="bg-neutral-900" />
            </div>
          </div>
          <a href="/containers" title="Close Details" class="mt-2 mr-2 text-gray-500"
            ><i class="fas fa-times" aria-hidden="true"></i></a>
        </div>
        <Route path="/logs">
          <ContainerDetailsLogs container="{container}" />
        </Route>
        <Route path="/inspect">
          <ContainerDetailsInspect container="{container}" />
        </Route>
        <Route path="/details">
          <div class="flex py-4">
            <table class="divide-y divide-gray-800 h-2">
              <tr>
                <td class="px-2">Id</td>
                <td class="px-2 font-thin text-xs">{container.shortId}</td>
              </tr>
              <tr>
                <td class="px-2">Command</td>
                <td class="px-2 font-thin text-xs">{container.command}</td>
              </tr>
              <tr>
                <td class="px-2">State</td>
                <td class="px-2 font-thin text-xs">{container.state}</td>
              </tr>
              <tr>
                <td class="px-2">Ports</td>
                <td class="px-2 font-thin text-xs" class:hidden="{container.hasPublicPort}">N/A</td>
                <td class="px-2 font-thin text-xs" class:hidden="{!container.hasPublicPort}">{container.port}</td>
              </tr>
            </table>
          </div>
        </Route>
        <Route path="/terminal">
          <ContainerDetailsTerminal container="{container}" />
        </Route>
      </div>
    </div>
  </Route>
{/if}
