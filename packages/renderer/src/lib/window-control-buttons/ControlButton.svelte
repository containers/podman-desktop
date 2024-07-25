<script lang="ts">
import WindowControlLinuxButton from './LinuxControlButton.svelte';
import WindowControlWindowsButton from './WindowsControlButton.svelte';

export let name: string;
export let action: () => void = () => {};
export let platform: string;
</script>

{#if platform === 'linux'}
  <WindowControlLinuxButton name={name} action={action} />
{:else if platform === 'win32'}
  <WindowControlWindowsButton name={name} action={action} />
{/if}
