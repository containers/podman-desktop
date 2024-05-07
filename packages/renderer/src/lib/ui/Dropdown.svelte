<script lang="ts">
export let id: string | undefined = undefined;
export let name: string | undefined = undefined;
export let value: unknown;
export let readonly: boolean = false;
export let disabled: boolean = false;
export let required: boolean = false;
export let error: boolean = false;

let enabled: boolean = true;
$: enabled = !readonly && !disabled;
</script>

<select
  class="w-full p-1 outline-none bg-[var(--pd-dropdown-bg)] border-[1px] border-transparent text-sm"
  class:border-b-[var(--pd-dropdown-stroke)]="{enabled && !error}"
  class:border-b-[var(--pd-dropdown-stroke-error)]="{enabled && error}"
  class:border-b-[var(--pd-dropdown-stroke-readonly)]="{!enabled}"
  class:text-[color:var(--pd-dropdown-focused-text)]="{enabled}"
  class:text-[color:var(--pd-dropdown-disabled-text)]="{!enabled}"
  class:hover:border-b-[var(--pd-dropdown-hover-stroke)]="{enabled && !error}"
  class:hover:border-b-[var(--pd-dropdown-stroke-error)]="{enabled && error}"
  class:hover:bg-[var(--pd-dropdown-hover-bg)]="{enabled}"
  id="{id}"
  name="{name}"
  required="{required}"
  bind:value="{value}"
  aria-label="{$$props['aria-label']}"
  aria-invalid="{$$props['aria-invalid']}">
  <slot />
</select>
