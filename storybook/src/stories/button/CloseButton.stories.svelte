<script context="module" lang="ts">
import { CloseButton } from '@podman-desktop/ui-svelte';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';
import { fn } from '@storybook/test';

const onclickFn = fn().mockName('onclick');

/**
 * These are the stories for the `CloseButton` component.
 */
const { Story } = defineMeta({
  component: CloseButton,
  title: 'Button/CloseButton',
  tags: ['autodocs'],
  args: {
    onclick: onclickFn,
  },
});

function doClick(): void {
  window.alert('clicked on the close button');
}
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <CloseButton on:click={doClick} />
{/snippet}

<Story name="Basic" />
