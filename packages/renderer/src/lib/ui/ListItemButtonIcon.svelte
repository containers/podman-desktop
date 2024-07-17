<script lang="ts">
import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { DropdownMenu, isFontAwesomeIcon } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import Fa from 'svelte-fa';

import { context as storeContext } from '/@/stores/context';

import type { ContextUI } from '../context/context';
import { ContextKeyExpr } from '../context/contextKey';

export let title: string;
export let icon: IconDefinition | string;
export let fontAwesomeIcon: IconDefinition | undefined = undefined;
export let hidden = false;
export let disabledWhen = '';
export let enabled: boolean = true;
export let onClick: () => void = () => {};
export let menu = false;
export let detailed = false;
export let inProgress = false;
export let iconOffset = '';
export let tooltip: string = '';

export let contextUI: ContextUI | undefined = undefined;

let positionLeftClass = 'left-1';
if (detailed) positionLeftClass = 'left-2';
let positionTopClass = 'top-1';
if (detailed) positionTopClass = '[0.2rem]';

let globalContext: ContextUI;
let contextsUnsubscribe: Unsubscriber;

$: {
  if (disabledWhen !== '') {
    if (contextUI) {
      globalContext = contextUI;
      computeEnabled();
    } else {
      if (contextsUnsubscribe) {
        contextsUnsubscribe();
      }
      contextsUnsubscribe = storeContext.subscribe(value => {
        globalContext = value;
        computeEnabled();
      });
    }
  }
}

function computeEnabled() {
  // Deserialize the `when` property
  const whenDeserialized = ContextKeyExpr.deserialize(disabledWhen);
  // if there is some error when evaluating the when expression, we use the default value enabled = true
  const disabled = whenDeserialized?.evaluate(globalContext) ?? false;
  enabled = !disabled;
}

onMount(() => {
  if (isFontAwesomeIcon(icon)) {
    fontAwesomeIcon = icon;
  }
});

onDestroy(() => {
  // unsubscribe from the store
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
});

const buttonDetailedClass =
  'text-[var(--pd-action-button-details-text)] bg-[var(--pd-action-button-details-bg)] hover:text-[var(--pd-action-button-details-hover-text)] font-medium rounded-lg text-sm inline-flex items-center px-3 py-2 text-center';
const buttonDetailedDisabledClass =
  'text-[var(--pd-action-button-details-disabled-text)] bg-[var(--pd-action-button-details-disabled-bg)] font-medium rounded-lg text-sm inline-flex items-center px-3 py-2 text-center';
const buttonClass =
  'text-[var(--pd-action-button-text)] hover:bg-[var(--pd-action-button-hover-bg)] hover:text-[var(--pd-action-button-hover-text)] font-medium rounded-full inline-flex items-center px-2 py-2 text-center';
const buttonDisabledClass =
  'text-[var(--pd-action-button-disabled-text)] font-medium rounded-full inline-flex items-center px-2 py-2 text-center';

// $: handleClick = enabled && !inProgress ? onClick : () => {};
$: handleClick = () => {
  if (enabled && !inProgress) {
    onClick();
  }
};
$: styleClass = detailed
  ? enabled && !inProgress
    ? buttonDetailedClass
    : buttonDetailedDisabledClass
  : enabled && !inProgress
    ? buttonClass
    : buttonDisabledClass;
</script>

<!-- If menu = true, use the menu, otherwise implement the button -->
{#if menu}
  <!-- enabled menu -->
  <DropdownMenu.Item
    title={title}
    tooltip={tooltip}
    icon={icon}
    enabled={enabled}
    hidden={hidden}
    onClick={handleClick} />
{:else}
  <!-- enabled button -->
  <button
    title={title}
    aria-label={title}
    on:click={handleClick}
    class="{styleClass} relative"
    class:disabled={inProgress}
    class:hidden={hidden}
    disabled={!enabled}>
    {#if fontAwesomeIcon}
      <Fa class="h-4 w-4 {iconOffset}" icon={fontAwesomeIcon} />
    {/if}

    <div
      aria-label="spinner"
      class="w-6 h-6 rounded-full animate-spin border border-solid border-[var(--pd-action-button-spinner)] border-t-transparent absolute {positionTopClass} {positionLeftClass}"
      class:hidden={!inProgress}>
    </div>
  </button>
{/if}
