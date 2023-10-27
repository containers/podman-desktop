<script lang="ts">
import { cliToolInfos } from '../../stores/cli-tools';
import Markdown from '../markdown/Markdown.svelte';
import SettingsPage from './SettingsPage.svelte';
import EngineIcon from '../ui/EngineIcon.svelte';
import EmptyScreen from '../ui/EmptyScreen.svelte';
</script>

<SettingsPage title="CLI Tools">
  <div class="h-full" role="table" aria-label="cli-tools">
    <EmptyScreen
      aria-label="no-resource-panel"
      icon="{EngineIcon}"
      title="No CLI tool has been registered"
      message="Start an extension that registers a CLI"
      hidden="{$cliToolInfos.length > 0}" />

    {#each $cliToolInfos as cliTool}
      <div role="row" class="bg-charcoal-600 mb-5 rounded-md p-3 divide-x divide-gray-900 flex">
        <div>
          <!-- left col - cli-tool icon/name + "create new" button -->
          <div class="min-w-[170px] max-w-[200px]">
            <div class="flex">
              {#if cliTool?.images?.icon}
                {#if typeof cliTool.images.icon === 'string'}
                  <img
                    src="{cliTool.images.icon}"
                    aria-label="cli-logo"
                    alt="{cliTool.name} logo"
                    class="max-w-[40px] h-full" />
                {/if}
              {/if}
              <span id="{cliTool.id}" class="my-auto text-gray-400 ml-3 break-words" aria-label="cli-name"
                >{cliTool.name}</span>
            </div>
          </div>
        </div>
        <!-- cli-tools columns -->
        <div class="grow flex-column divide-gray-900 ml-2">
          <span class="my-auto text-gray-400 ml-3 break-words" aria-label="cli-display-name"
            >{cliTool.displayName}</span>
          <div role="region" class="float-right text-gray-900 px-2 text-sm" aria-label="cli-registered-by">
            Registered by {cliTool.extensionInfo.label}
          </div>
          <div role="region" class="ml-3 mt-2 text-sm text-gray-300">
            <Markdown markdown="{cliTool.description}" />
          </div>
        </div>
      </div>
    {/each}
  </div>
</SettingsPage>
