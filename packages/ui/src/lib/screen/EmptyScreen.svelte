<script lang="ts">
import { faPaste, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { type Component, createEventDispatcher, onMount, type Snippet } from 'svelte';

import Button from '../button/Button.svelte';
import Icon from '../icons/Icon.svelte';
import { isFontAwesomeIcon } from '../utils/icon-utils';

interface Props {
  icon?: IconDefinition | Component | string;
  title?: string;
  message?: string;
  detail?: string;
  commandline?: string;
  hidden?: boolean;
  class?: string;
  style?: string;
  'aria-label'?: string;
  upperContent?: Snippet;
  children?: Snippet;
  onclick?: (text: string) => void;
}

let {
  icon,
  title = 'No title',
  message = '',
  detail = '',
  commandline = '',
  hidden = false,
  class: className,
  style,
  'aria-label': ariaLabel,
  upperContent,
  children,
  onclick = (text): void => {
    dispatch('click', text);
  },
}: Props = $props();

let fontAwesomeIcon = $state(false);
let processed = $state(false);

const dispatch = createEventDispatcher<{ click: string }>();

onMount(() => {
  if (isFontAwesomeIcon(icon)) {
    fontAwesomeIcon = true;
  }
  processed = true;
});

function handleClick(): void {
  const text = copyTextDivElement?.textContent;
  if (text) {
    onclick(text);
  }
}

let copyTextDivElement = $state<HTMLDivElement>();
</script>

<div
  class="flex flex-row w-full h-full justify-center {className}"
  class:hidden={hidden}
  style={style}
  aria-label={ariaLabel}>
  <div class="flex flex-col h-full justify-center text-center space-y-3">
    <div class="flex justify-center text-[var(--pd-details-empty-icon)] py-2">
      {#if processed && icon}
        {#if fontAwesomeIcon}
          <Icon icon={icon} size='4x'/>
        {:else}
          <Icon icon={icon} size=55/>
        {/if}
      {/if}
    </div>
    <h1 class="text-xl text-[var(--pd-details-empty-header)]">{title}</h1>
    {@render upperContent?.()}
    <span class="text-[var(--pd-details-empty-sub-header)] max-w-[800px] text-pretty mx-2">{message}</span>
    {#if detail}
      <span class="text-[var(--pd-details-empty-sub-header)]">{detail}</span>
    {/if}
    {#if commandline}
      <div
        class="flex flex-row bg-[var(--pd-details-empty-cmdline-bg)] items-center justify-between rounded-xs p-3 mt-4">
        <div
          class="font-mono text-[var(--pd-details-empty-cmdline-text)]"
          bind:this={copyTextDivElement}
          data-testid="copyTextDivElement">
          {commandline}
        </div>
        <Button title="Copy To Clipboard" class="ml-5" on:click={handleClick} type="link">
          <Icon class="h-5 w-5 cursor-pointer text-xl text-(--pd-button-icon-primary-text)" icon={faPaste}/>
        </Button>
      </div>
    {/if}
    {#if children}
      <div class="py-2">
        {@render children()}
      </div>
    {/if}
  </div>
</div>
