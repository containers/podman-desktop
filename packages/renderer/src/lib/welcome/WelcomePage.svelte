<script lang="ts">
import bgImage from './background.png';
import DesktopIcon from '../images/DesktopIcon.svelte';
import Fa from 'svelte-fa/src/fa.svelte';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { onMount } from 'svelte';
import { WelcomeUtils } from './welcome-utils';
import { router } from 'tinro';
import { featuredExtensionInfos } from '/@/stores/featuredExtensions';
import Tooltip from '../ui/Tooltip.svelte';

export let showWelcome = false;
export let showTelemetry = false;

let telemetry = true;

const welcomeUtils = new WelcomeUtils();
let podmanDesktopVersion;

onMount(async () => {
  const ver = await welcomeUtils.getVersion();
  if (!ver) {
    welcomeUtils.updateVersion('initial');
    showWelcome = true;
  }
  const telemetryPrompt = await welcomeUtils.havePromptedForTelemetry();
  if (!telemetryPrompt) {
    showTelemetry = true;
  }
  podmanDesktopVersion = await window.getPodmanDesktopVersion();
});

function closeWelcome() {
  showWelcome = false;
  if (showTelemetry) {
    welcomeUtils.setTelemetry(telemetry);
  }
}
</script>

{#if showWelcome}
  <div
    class="flex flex-col flex-auto fixed top-10 left-0 right-0 bottom-0 bg-zinc-700 bg-no-repeat z-50"
    style="background-image: url({bgImage}); background-position: 50% -175%; background-size: 100% 75%">
    <!-- Header -->
    <div class="flex flex-row flex-none backdrop-blur p-6">
      <div class="flex flex-auto text-lg font-bold">Get started with Podman Desktop</div>
    </div>

    <!-- Body -->
    <div class="flex flex-col justify-center content-center flex-auto backdrop-blur p-2 overflow-y-auto">
      <div class="flex justify-center p-2"><DesktopIcon /></div>
      <div class="flex justify-center text-lg font-bold p-2">
        <span class="mr-2">🎉</span>Welcome to Podman Desktop v{podmanDesktopVersion} !
      </div>
      <div class="flex flex-row justify-center">
        <div class="bg-charcoal-500 px-4 pb-4 pt-2 rounded">
          <div class="flex justify-center text-sm text-gray-700 pb-2">
            <div>Podman desktop supports many container engines and orchestrators, such as:</div>
          </div>
          <div class="grid grid-cols-3 gap-3">
            {#each $featuredExtensionInfos as featuredExtension}
              <div
                class="rounded-md
           bg-charcoal-700 flex flex-row justify-center border-charcoal-700 p-2">
                <div class="place-items-top flex flex-col flex-1">
                  <div class="flex flex-row place-items-center flex-1">
                    <div>
                      <img
                        alt="{featuredExtension.displayName} logo"
                        class="max-h-6 max-w-[24px] h-auto w-auto"
                        src="{featuredExtension.icon}" />
                    </div>
                    <div
                      class="flex flex-1 mx-2 underline decoration-2 decoration-dotted underline-offset-2 cursor-default justify-center">
                      <Tooltip tip="{featuredExtension.description}" top>
                        {featuredExtension.displayName}
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
      <div class="flex justify-center p-2 text-sm">
        Configure these and more under <button
          class="text-violet-400 pl-1"
          on:click="{() => {
            closeWelcome();
            router.goto('/preferences');
          }}">Settings</button
        >.
      </div>
    </div>

    <!-- Telemetry -->
    {#if showTelemetry}
      <div class="flex flex-col justify-end flex-none p-4">
        <div class="flex flex-row justify-center items-start p-1 text-sm">
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              id="toggle-telemetry"
              class="sr-only peer"
              bind:checked="{telemetry}"
              name="Enable telemetry"
              type="checkbox"
              aria-label="Enable telemetry" />
            <div
              class="w-4 h-4 rounded border-2 border-gray-700 peer peer-checked:bg-violet-500 peer-checked:border-violet-500">
            </div>
            <Fa class="w-4 h-4 absolute text-zinc-700" size="10" icon="{faCheck}" />
            <span class="font-medium font-bold px-2">Telemetry:</span>
          </label>
          <div class="w-2/5 text-gray-400">
            Help Red Hat improve Podman Desktop by allowing anonymous usage data to be collected.
            <button
              class="text-violet-400 pl-1"
              on:click="{() => {
                window.openExternal('https://developers.redhat.com/article/tool-data-collection');
              }}">Read our privacy statement</button>
          </div>
        </div>
        <div class="flex justify-center p-1 text-sm text-gray-700">
          <div>
            You can always modify this preference later in <button
              class="text-gray-700 pl-1"
              on:click="{() => {
                closeWelcome();
                router.goto('/preferences/default/preferences.telemetry');
              }}">Settings &gt; Preferences</button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Footer - button bar -->
    <div class="flex justify-end flex-none bg-charcoal-600 p-8">
      <div class="flex flex-row">
        <button
          class="pf-c-button pf-m-primary w-30 px-6"
          type="button"
          on:click="{() => {
            closeWelcome();
          }}">Go to Podman Desktop</button>
      </div>
    </div>
  </div>
{/if}
