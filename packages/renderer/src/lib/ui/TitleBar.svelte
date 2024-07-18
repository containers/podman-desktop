<script lang="ts">
import { onMount } from 'svelte';

import DesktopIcon from '../images/DesktopIcon.svelte';
import WindowControlButtons from '../window-control-buttons/ControlButtons.svelte';

let platform: string;

const title = 'Podman Desktop';

onMount(async () => {
  platform = await window.getOsPlatform();
});
</script>

<header
  id="navbar"
  class="{platform === 'win32' ? 'bg-[#202020]' : 'bg-[var(--pd-titlebar-bg)]'} body-font z-[999] relative {platform ===
  'win32'
    ? 'min-h-[32px]'
    : 'min-h-[38px]'}"
  style="-webkit-app-region: drag;">
  <div class="flex select-none">
    <!-- On Linux, title is centered and we have control buttons in the title bar-->
    {#if platform === 'linux'}
      <div class="flex mx-auto flex-row pt-[7px] pb-[6px] items-center">
        <div class="absolute left-[10px] top-[10px]">
          <DesktopIcon size="18" />
        </div>
        <div class="flex flex-1 justify-center text-base select-none text-[color:var(--pd-titlebar-text)]">{title}</div>
        <WindowControlButtons platform={platform} />
      </div>
    {:else if platform === 'win32'}
      <div class="flex flex-row pt-[10px] pb-[10px] items-center">
        <div class="absolute left-[7px] top-[7px]">
          <DesktopIcon size="18" />
        </div>
        <div class="ml-[35px] text-left text-xs leading-3 text-[color:var(--pd-titlebar-text)]">{title}</div>
        <WindowControlButtons platform={platform} />
      </div>
    {/if}
  </div>
</header>
