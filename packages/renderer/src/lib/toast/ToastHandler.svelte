<style>
.svelte-toast-wrapper {
  font-size: 0.8rem;
  --toastMinHeight: 2rem;
  --toastBorderRadius: 0.2rem;
}
</style>

<script lang="ts">
import { SvelteToast, toast } from '@zerodevx/svelte-toast';
import { onDestroy, onMount } from 'svelte';

let callback: (object: { type: string; message: string }) => void;

onMount(() => {
  callback = (object: { type: string; message: string }) => {
    let theme: any = {};
    if (object.type === 'success') {
      theme = {
        '--toastBackground': '#16a34a',
        '--toastColor': '#bbf7d0',
        '--toastBarBackground': '#14532d',
      };
    } else if (object.type === 'error') {
      theme = {
        '--toastBackground': 'red',
        '--toastColor': 'white',
        '--toastBarBackground': 'maroon',
      };
    } else if (object.type === 'warning') {
      theme = {
        '--toastBackground': 'yellow',
        '--toastColor': 'black',
        '--toastBarBackground': 'olive',
      };
    } else if (object.type === 'info') {
      theme = {
        '--toastBackground': 'blue',
        '--toastColor': 'white',
        '--toastBarBackground': 'navy',
      };
    }
    toast.push(object.message, { pausable: true, theme });
  };

  window.events?.receive('toast:handler', (object: unknown) => {
    const value = object as { type: string; message: string };
    callback(value);
  });
});

onDestroy(() => {
  callback = () => {};
});
</script>

<div class="svelte-toast-wrapper">
  <SvelteToast />
</div>
