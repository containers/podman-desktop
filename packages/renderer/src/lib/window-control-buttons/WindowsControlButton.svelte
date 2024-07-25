<script lang="ts">
import { onMount } from 'svelte';

import WindowsExitIcon from '/@/lib/images/WindowsExitIcon.svelte';
import WindowsMaxIcon from '/@/lib/images/WindowsMaxIcon.svelte';
import WindowsMinIcon from '/@/lib/images/WindowsMinIcon.svelte';
import WindowsUnmaxIcon from '/@/lib/images/WindowsUnmaxIcon.svelte';

const iconSize = '16';
let icon: any;
let state = 'initial';

export let name: string;

export let action: () => void = () => {};

let titleName: string;

onMount(() => {
  if (name === 'Minimize') {
    icon = WindowsMinIcon;
  } else if (name === 'Maximize') {
    icon = WindowsMaxIcon;
  } else if (name === 'Close') {
    icon = WindowsExitIcon;
  }
  titleName = name;
});

function executeAction() {
  // perform action
  action();

  // update the state
  if (name === 'Minimize') {
    state = 'minimized';
  } else if (name === 'Maximize') {
    if (state === 'maximized') {
      state = 'restored';
    } else {
      state = 'maximized';
    }
  } else if (name === 'Close') {
    state = 'closed';
  }

  if (state === 'maximized') {
    icon = WindowsUnmaxIcon;
    titleName = 'Restore';
  } else if (state === 'restored') {
    icon = WindowsMaxIcon;
    titleName = 'Maximize';
  }
}
</script>

<button
  on:click={() => executeAction()}
  aria-label={name}
  title={titleName}
  class="h-[32px] w-[45px] cursor-pointer text-white {name === 'Close'
    ? 'hover:bg-[#be4425]'
    : 'hover:bg-[#2d2d2d]'} flex place-items-center justify-center">
  <svelte:component this={icon} size={iconSize} />
</button>
