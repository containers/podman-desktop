<script lang="ts">
import { faCircleArrowUp, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import type { CliToolInfo } from '../../../../main/src/plugin/api/cli-tool-info';
import Markdown from '../markdown/Markdown.svelte';
import Button from '../ui/Button.svelte';
import LoadingIconButton from '../ui/LoadingIconButton.svelte';
import { type ConnectionCallback, eventCollect, startTask } from './preferences-connection-rendering-task';
import type { ILoadingStatus } from './Util';

export let cliTool: CliToolInfo;
let showError = false;
let cliToolStatus: ILoadingStatus = {
  inProgress: false,
  status: cliTool.newVersion ? 'toUpdate' : 'unknown',
  action: 'update',
};

async function update(cliTool: CliToolInfo) {
  try {
    cliToolStatus.inProgress = true;
    cliToolStatus = cliToolStatus;
    const loggerHandlerKey = startTask(
      `Update ${cliTool.name} to v${cliTool.newVersion}`,
      '/preferences/cli-tools',
      getLoggerHandler(cliTool.id),
    );
    await window.updateCliTool(cliTool.id, loggerHandlerKey, eventCollect);
    showError = false;
    cliToolStatus.status = 'unknown';
  } catch (e) {
    showError = true;
  } finally {
    cliToolStatus.inProgress = false;
    cliToolStatus = cliToolStatus;
  }
}

function getLoggerHandler(_cliToolId: string): ConnectionCallback {
  return {
    log: () => {},
    warn: () => {},
    error: _args => {
      showError = true;
    },
    onEnd: () => {},
  };
}
</script>

<div role="row" class="bg-charcoal-600 mb-5 rounded-md p-3 flex flex-col">
  <div class="divide-x divide-gray-900 flex flex-row">
    <div>
      <!-- left col - cli-tool icon/name + "create new" button -->
      <div class="min-w-[170px] max-w-[200px] h-full flex flex-col justify-between">
        <div class="flex flex-row">
          {#if cliTool?.images?.icon || cliTool?.extensionInfo.icon}
            {#if typeof cliTool.images?.icon === 'string'}
              <img
                src="{cliTool.images.icon}"
                aria-label="cli-logo"
                alt="{cliTool.name} logo"
                class="max-w-[40px] max-h-[40px] h-full" />
            {:else if typeof cliTool.extensionInfo.icon === 'string'}
              <img
                src="{cliTool.extensionInfo.icon}"
                aria-label="cli-logo"
                alt="{cliTool.name} logo"
                class="max-w-[40px] max-h-[40px] h-full" />
            {/if}
          {/if}
          <span id="{cliTool.id}" class="my-auto ml-3 break-words" aria-label="cli-name">{cliTool.name}</span>
        </div>
        {#if cliTool.version && cliToolStatus}
          <div class="p-0.5 rounded-lg bg-charcoal-900 w-fit">
            <LoadingIconButton
              action="update"
              clickAction="{() => {
                if (cliTool.newVersion) {
                  update(cliTool);
                }
              }}"
              icon="{faCircleArrowUp}"
              leftPosition="left-[0.4rem]"
              state="{cliToolStatus}"
              color="primary"
              tooltip="{!cliTool.newVersion ? 'No updates' : `Update to v${cliTool.newVersion}`}" />
          </div>
        {/if}
      </div>
    </div>
    <!-- cli-tools columns -->
    <div class="grow flex-column divide-gray-900 ml-2">
      <span class="my-auto ml-3 break-words" aria-label="cli-display-name">{cliTool.displayName}</span>
      <div role="region" class="float-right text-gray-900 px-2 text-sm" aria-label="cli-registered-by">
        Registered by {cliTool.extensionInfo.label}
      </div>
      <div role="region" class="ml-3 mt-2 text-sm text-gray-300">
        <div class="text-gray-700">
          <Markdown markdown="{cliTool.description}" />
        </div>
        {#if cliTool.version}
          <div class="flex flex-row justify-between align-center bg-charcoal-900 p-2 rounded-lg min-w-[320px] w-fit">
            <div class="flex text-white-400 font-bold text-xs items-center" aria-label="cli-version">
              {cliTool.name} v{cliTool.version}
            </div>
            {#if cliTool.newVersion}
              <Button
                type="link"
                class="underline"
                padding="p-0"
                on:click="{() => {
                  if (cliTool.newVersion) {
                    update(cliTool);
                  }
                }}"
                title="{`${cliTool.displayName} will be updated to v${cliTool.newVersion}`}"
                disabled="{!cliTool.newVersion}"
                aria-label="Update available">
                Update available
              </Button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
  {#if showError}
    <div class="flex flex-row items-center text-xs text-red-400 ml-[200px] mt-2">
      <Fa icon="{faCircleXmark}" class="mr-1 text-red-500" />
      <span>Unable to update {cliTool.displayName} to version {cliTool.newVersion}. </span>
      <Button
        type="link"
        padding="p-0"
        class="ml-1 text-xs"
        aria-label="{cliTool.displayName} failed"
        on:click="{() => window.events?.send('toggle-task-manager', '')}">Check why it failed</Button>
    </div>
  {/if}
</div>
