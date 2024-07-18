<script lang="ts">
import Select from 'svelte-select';

export let onChange = (_e: CustomEvent) => {};
export let onClear = (_e: CustomEvent) => {};
export let focused: boolean = false;
</script>

<Select
  {...$$props}
  --background="var(--pd-input-field-bg)"
  --height="32px"
  --margin="0"
  --padding="0"
  --font-size="12px"
  --border="1px solid var(--pd-input-field-stroke)"
  --border-focused="1px solid var(--pd-input-field-hover-stroke)"
  --border-hover="1px solid var(--pd-input-field-hover-stroke)"
  --border-radius="0"
  --border-radius-focused="6px"
  --clear-select-focus-outline="1px solid var(--pd-input-field-hover-stroke)"
  --disabled-background="var(--pd-input-field-disabled-bg)"
  --disabled-color="var(--pd-input-field-disabled-text)"
  --input-margin="0"
  --input-padding="0"
  --item-hover-bg="var(--pd-dropdown-item-hover-bg)"
  --item-hover-color="var(--pd-dropdown-item-hover-text)"
  --item-is-active-bg="var(--pd-dropdown-item-hover-bg)"
  --item-is-active-text="var(--pd-dropdown-item-hover-text)"
  --list-border="1px solid var(--pd-dropdown-ring)"
  --list-border-radius="6px"
  --list-background="var(--pd-dropdown-bg)"
  --placeholder-color="var(--pd-input-field-placeholder-text)"
  containerStyles={!focused ? 'border-width: 0 0 1px 0' : 'background-color: var(--pd-input-field-focused-bg)'}
  on:change={onChange}
  on:clear={onClear}
  bind:focused={focused}
  clearFilterTextOnBlur={false}>
  <div slot="empty" class="m-4 text-center">
    You can search an image in a specific registry by typing <code>registry-name/query</code>
  </div>
  <svg
    slot="prepend"
    xmlns="http://www.w3.org/2000/svg"
    class="w-4 h-4 mx-1 text-gray-700"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    role="img">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
</Select>
