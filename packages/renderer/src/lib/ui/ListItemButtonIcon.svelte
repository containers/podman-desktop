<script lang="ts">
import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/motion';
import Fa from 'svelte-fa';

import { context as storeContext } from '/@/stores/context';

import type { ContextUI } from '../context/context';
import { ContextKeyExpr } from '../context/contextKey';
import DropdownMenuItem from './DropDownMenuItem.svelte';

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

// Pop up with a dialog before executing the action
export let confirm = false;

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
  const disabled = whenDeserialized?.evaluate(globalContext) || false;
  enabled = !disabled;
}

onMount(() => {
  if ((icon as IconDefinition)?.prefix?.startsWith('fa')) {
    fontAwesomeIcon = icon as IconDefinition;
  }
});

onDestroy(() => {
  // unsubscribe from the store
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
});

const buttonDetailedClass =
  'text-gray-400 bg-charcoal-800 hover:text-violet-600 font-medium rounded-lg text-sm inline-flex items-center px-3 py-2 text-center';
const buttonDetailedDisabledClass =
  'text-gray-900 bg-charcoal-800 font-medium rounded-lg text-sm inline-flex items-center px-3 py-2 text-center';
const buttonClass =
  'm-0.5 text-gray-400 hover:bg-charcoal-600 hover:text-violet-600 font-medium rounded-full inline-flex items-center px-2 py-2 text-center';
const buttonDisabledClass =
  'm-0.5 text-gray-900 font-medium rounded-full inline-flex items-center px-2 py-2 text-center';

// $: handleClick = enabled && !inProgress ? onClick : () => {};
$: handleClick = () => {
  if (enabled && !inProgress) {
    if (confirm) {
      window
        .showMessageBox({
          title: 'Confirmation',
          message: 'Are you sure you want to ' + title.toLowerCase() + '?',
          buttons: ['Yes', 'Cancel'],
        })
        .then(result => {
          if (result && result.response === 0) {
            onClick();
          }
        });
    } else {
      onClick();
    }
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
  <DropdownMenuItem title="{title}" icon="{icon}" enabled="{enabled}" hidden="{hidden}" onClick="{handleClick}" />
{:else}
  <!-- enabled button -->
  <button
    title="{title}"
    aria-label="{title}"
    on:click="{handleClick}"
    class="{styleClass} relative"
    class:disabled="{inProgress}"
    class:hidden="{hidden}"
    disabled="{!enabled}">
    {#if fontAwesomeIcon}
      <Fa class="h-4 w-4 {iconOffset}" icon="{fontAwesomeIcon}" />
    {/if}

    <div
      aria-label="spinner"
      class="w-6 h-6 rounded-full animate-spin border border-solid border-violet-500 border-t-transparent absolute {positionTopClass} {positionLeftClass}"
      class:hidden="{!inProgress}">
    </div>
  </button>
{/if}
