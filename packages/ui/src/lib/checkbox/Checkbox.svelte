<script lang="ts">
import { faSquare as faOutlineSquare } from '@fortawesome/free-regular-svg-icons';
import { faCheckSquare, faMinusSquare, faSquare } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';
import Fa from 'svelte-fa';

export let checked = false;
export let disabled = false;
export let indeterminate = false;
export let disabledTooltip = '';
export let title = '';
export let id: string | undefined = undefined;
export let name: string | undefined = undefined;
export let required = false;

const dispatch = createEventDispatcher<{ click: boolean }>();

function onClick(
  event: MouseEvent & {
    currentTarget: EventTarget & HTMLInputElement;
  },
): void {
  const checked = event.currentTarget.checked;
  dispatch('click', checked);
}
</script>

<label class="flex flex-row items-center {$$props.class || ''}">
  <div class="relative p-2 self-start" class:mt-0.5={$$slots.default} class:mr-1={$$slots.default}>
    <div
      class="grid absolute left-0 top-0"
      title={disabled ? disabledTooltip : title}
      class:cursor-pointer={!disabled}
      class:cursor-not-allowed={disabled}>
      {#if disabled}
        <Fa size="1.1x" icon={faSquare} class="text-[var(--pd-input-checkbox-disabled)]" />
      {:else if indeterminate}
        <Fa
          size="1.1x"
          icon={faMinusSquare}
          class="text-[var(--pd-input-checkbox-indeterminate)] hover:text-[var(--pd-input-checkbox-focused-indeterminate)]" />
      {:else if checked}
        <Fa
          size="1.1x"
          icon={faCheckSquare}
          class="text-[var(--pd-input-checkbox-checked)] hover:text-[var(--pd-input-checkbox-focused-checked)]" />
      {:else}
        <Fa
          size="1.1x"
          icon={faOutlineSquare}
          class="text-[var(--pd-input-checkbox-unchecked)] hover:text-[var(--pd-input-checkbox-focused-unchecked)]" />
      {/if}
    </div>
    <input
      aria-label={title}
      type="checkbox"
      id={id}
      name={name}
      bind:checked={checked}
      disabled={disabled}
      required={required}
      class:cursor-pointer={!disabled}
      class:cursor-not-allowed={disabled}
      class="opacity-0 absolute top-0 left-0 w-px h-px text-lg"
      on:click={onClick} />
  </div>
  <slot />
</label>
