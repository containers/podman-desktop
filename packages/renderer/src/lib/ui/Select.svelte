<script lang="ts">
import Select from 'svelte-select';

export let onChange = (_e: CustomEvent) => {};
export let onClear = (_e: CustomEvent) => {};
</script>

<Select
  {...$$props}
  --background="var(--pd-input-field-bg)"
  --height="36px"
  --margin="0"
  --padding="8px"
  --font-size="12px"
  --border="transparent"
  --border-focused="transparent"
  --border-hover="transparent"
  --border-radius="0"
  --border-radius-focused="0"
  --disabled-background="var(--pd-input-field-disabled-bg)"
  --disabled-color="var(--pd-input-field-disabled-text)"
  --input-margin="0"
  --input-padding="0"
  --item-hover-bg="var(--pd-dropdown-item-hover-bg)"
  --item-is-active-bg="var(--pd-dropdown-item-hover-bg)"
  --item-is-active-text="var(--pd-dropdown-item-hover-text)"
  --list-background="var(--pd-dropdown-bg)"
  --placeholder-color="var(--pd-input-field-placeholder-text)"
  on:change="{onChange}"
  on:clear="{onClear}"></Select>
