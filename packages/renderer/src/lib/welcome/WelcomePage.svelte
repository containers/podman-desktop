<script lang="ts">
import bgImage from './background.png';
import DesktopIcon from '../images/DesktopIcon.svelte';
import Fa from 'svelte-fa/src/fa.svelte';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { onMount } from 'svelte';
import { WelcomeUtils } from './welcome-utils';
import { router } from 'tinro';

export let showWelcome = false;

onMount(async () => {
  const welcomeUtils = new WelcomeUtils();
  const ver = await welcomeUtils.getVersion();
  if (!ver) {
    welcomeUtils.updateVersion('initial');
    showWelcome = true;
  }
});
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
      <div class="flex justify-center text-lg font-bold p-4">
        <span class="mr-2">🎉</span>Welcome to Podman Desktop!
      </div>
      <div class="flex flex-row justify-center p-4">
        <div class="bg-zinc-800 rounded-lg p-5 text-sm">
          <div class="font-bold">Podman Desktop supports many container engines, including:</div>
          <div class="flex flex-row px-5 justify-center">
            <div class="flex flex-col px-4 py-2">
              <div class="flex flex-row place-items-center p-1">
                <div><Fa size="10" class="text-violet-600" icon="{faCircle}" /></div>
                <div class="px-2">Podman</div>
              </div>
              <div class="flex flex-row place-items-center p-1">
                <div><Fa size="10" class="text-violet-600" icon="{faCircle}" /></div>
                <div class="px-2">Lima</div>
              </div>
            </div>

            <div class="flex flex-col px-4 py-2">
              <div class="flex flex-row place-items-center p-1">
                <div><Fa size="10" class="text-violet-600" icon="{faCircle}" /></div>
                <div class="px-2">Docker</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-center p-2 text-sm">
        Configure these and more under <button
          class="text-violet-400 pl-1"
          on:click="{() => {
            showWelcome = false;
            router.goto('/preferences');
          }}">Settings</button
        >.
      </div>
    </div>

    <!-- Footer - button bar -->
    <div class="flex justify-end flex-none bg-zinc-800 p-8">
      <div class="flex flex-row">
        <button
          class="pf-c-button pf-m-primary w-30 px-6"
          type="button"
          on:click="{() => {
            showWelcome = false;
          }}">Go to Podman Desktop</button>
      </div>
    </div>
  </div>
{/if}
