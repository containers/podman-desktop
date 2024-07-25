<script lang="ts">
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import type { OpenDialogOptions } from '@podman-desktop/api';
import { Button, Input } from '@podman-desktop/ui-svelte';

export let placeholder: string | undefined = undefined;
export let id: string | undefined = undefined;
export let name: string | undefined = undefined;
export let value: string | undefined = undefined;
export let options: OpenDialogOptions;
export let readonly: boolean = false;
export let required: boolean = false;

async function openDialog() {
  const result = await window.openDialog(options);
  if (result?.[0]) {
    value = result[0];
  }
}
</script>

<div class="flex flex-row grow space-x-1.5">
  <Input
    id={id}
    name={name}
    class={$$props.class || ''}
    bind:value={value}
    on:input
    on:keypress
    placeholder={placeholder}
    readonly={readonly}
    required={required}
    aria-label={$$props['aria-label']}
    aria-invalid={$$props['aria-invalid']}>
  </Input>
  <Button aria-label="browse" icon={faFolderOpen} on:click={openDialog} />
</div>
