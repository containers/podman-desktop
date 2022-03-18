<script lang="ts">
import type { ContainerInfoUI } from './container/ContainerInfoUI';
import { Route } from 'tinro';
import ContainerIcon from './ContainerIcon.svelte';
import 'xterm/css/xterm.css';
import ContainerDetailsTerminal from './ContainerDetailsTerminal.svelte';
import ContainerDetailsLogs from './ContainerDetailsLogs.svelte';
import ContainerActions from './container/ContainerActions.svelte';

export let container: ContainerInfoUI;
</script>

<Route path="/*" let:meta>
  <div class="w-full h-full mx-2 p-2 border border-gray-500">
    <div class="flex h-full flex-col">
      <div class="flex w-full flex-row">
        <div>
          <div class="text-lg"><ContainerIcon state="{container.state}" /> {container.name}</div>
          <div class="text-base text-violet-400">{container.image}</div>
          <div class="flex py-4">
            <table class="divide-y divide-gray-800 h-2">
              <tr>
                <td class="px-2">Id</td>
                <td class="px-2">Command</td>
                <td class="px-2">State</td>
                <td class="px-2">Ports</td>
              </tr>
              <tr class="">
                <td class="px-2 font-thin text-xs">{container.shortId}</td>
                <td class="px-2 font-thin text-xs">{container.command}</td>
                <td class="px-2 font-thin text-xs">{container.state}</td>
                <td class="px-2 font-thin text-xs" class:hidden="{container.hasPublicPort}">N/A</td>
                <td class="px-2 font-thin text-xs" class:hidden="{!container.hasPublicPort}">{container.port}</td>
              </tr>
            </table>
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
                  <!--
                <li class="pf-c-tabs__item" class:pf-m-current="{meta.url === '/containers/inspect'}">
                  <a
                    href="/containers/inspect"
                    class="pf-c-tabs__link"
                    aria-controls="open-tabs-example-tabs-list-yaml-panel"
                    id="open-tabs-example-tabs-list-yaml-link">
                    <span class="pf-c-tabs__item-text">Inspect</span>
                  </a>
                </li>
                -->
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
                </ul>
              </div>
            </div>
          </section>
        </div>
        <div class="flex flex-row-reverse w-full">
          <div class="flex h-2">
            <ContainerActions container="{container}" />
          </div>
        </div>
      </div>
      <Route path="/{container.id}/logs">
        <ContainerDetailsLogs container="{container}" />
      </Route>
      <Route path="/inspect">Inspect</Route>
      <Route path="/{container.id}/terminal">
        <ContainerDetailsTerminal container="{container}" />
      </Route>
    </div>
  </div>
</Route>
