<script lang="ts">
import type { OpenDialogOptions } from '@desktop-framework/extension-api';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { Button, Input } from '@podman-desktop/ui-svelte';

interface Props {
  placeholder?: string;
  id?: string;
  name?: string;
  value?: string;
  options: OpenDialogOptions;
  readonly?: boolean;
  required?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
  onChange?: (value: string) => void;
  class?: string;
  'aria-label'?: string;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
}
let {
  placeholder,
  id,
  name,
  value = $bindable(),
  options,
  readonly = false,
  required = false,
  clearable = false,
  disabled = false,
  error,
  onChange = (): void => {},
  class: className,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
}: Props = $props();

async function openDialog(): Promise<void> {
  const result = await window.openDialog(options);
  if (result?.[0]) {
    value = result[0];
    onChange(value);
  }
}

function onInput(event: Event): void {
  const inputEvent = event as Event & { target: HTMLInputElement };
  onChange(inputEvent.target.value);
}
</script>

<div class="flex flex-row grow space-x-1.5">
  <Input
    id={id}
    name={name}
    class={className}
    bind:value={value}
    oninput={onInput}
    on:keypress
    placeholder={placeholder}
    readonly={readonly}
    required={required}
    clearable={clearable}
    disabled={disabled}
    error={error}
    aria-label={ariaLabel}
    aria-invalid={ariaInvalid}>
  </Input>
  <Button aria-label="browse" icon={faFolderOpen} on:click={openDialog} disabled={disabled} />
</div>
