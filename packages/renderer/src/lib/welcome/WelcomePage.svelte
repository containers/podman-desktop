<script lang="ts">
import bgImage from './background.png';
import DesktopIcon from '../images/DesktopIcon.svelte';
import Fa from 'svelte-fa/src/fa.svelte';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
</script>

<div
  class="flex flex-col flex-auto min-w-full bg-zinc-700 overflow-y-scroll"
  style="background-image: url({bgImage}); background-position: 50% -175%; background-repeat: no-repeat; background-size: 100% 75%">
  <!-- Header -->
  <div class="flex flex-row flex-none backdrop-blur p-6">
    <div class="flex flex-auto text-lg font-bold">Get started with Podman Desktop</div>
  </div>

  <!-- Body -->
  <div class="flex flex-col justify-center content-center flex-auto backdrop-blur p-6">
    <div class="flex justify-center p-2"><DesktopIcon /></div>
    <div class="flex justify-center text-lg font-bold p-4">🎉 Welcome to Podman Desktop!</div>
    <div class="flex flex-row justify-center p-4">
      <div class="bg-zinc-800 rounded-lg p-5 text-sm">
        <div class="font-bold">Podman Desktop supports many container engines, such as:</div>
        <div class="flex flex-row px-5">
          <div class="flex flex-col px-4 py-2">
            <div class="flex flex-row place-items-center p-1">
              <div><Fa size="10" class="text-violet-600" icon="{faCircle}" /></div>
              <div class="px-2">
                <a class="text-white hover:text-violet-600 hover:no-underline" href="https://podman.io">Podman</a>
              </div>
            </div>
            <div class="flex flex-row place-items-center p-1">
              <div><Fa size="10" class="text-violet-600" icon="{faCircle}" /></div>
              <div class="px-2">
                <a class="text-white hover:text-violet-600 hover:no-underline" href="https://github.com/lima-vm/lima"
                  >Lima</a>
              </div>
            </div>
          </div>

          <div class="flex flex-col px-4 py-2">
            <div class="flex flex-row place-items-center p-1">
              <div><Fa size="10" class="text-violet-600" icon="{faCircle}" /></div>
              <div class="px-2">
                <a class="text-white hover:text-violet-600 hover:no-underline" href="https://www.docker.com">Docker</a>
              </div>
            </div>
            <div class="flex flex-row place-items-center p-1">
              <div><Fa size="10" class="text-violet-600" icon="{faCircle}" /></div>
              <div class="px-2">
                <a
                  class="text-white hover:text-violet-600 hover:no-underline"
                  href="https://developers.redhat.com/products/openshift-local">OpenShift Local Podman preset</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-center p-2 text-sm">Configure these and more under Settings.</div>
  </div>

  <!-- Footer - button bar -->
  <div class="flex justify-end flex-none bg-zinc-800 p-8">
    <div class="flex flex-row">
      <a href="/"><button class="pf-c-button pf-m-primary w-30 px-6" type="button">Go to Podman Desktop</button></a>
    </div>
  </div>
</div>
