<script context="module" lang="ts">
import { Tab } from '@podman-desktop/ui-svelte';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * These are the stories for the `Tab` component.
 * Interact with tabs.
 */
const { Story } = defineMeta({
  component: Tab,
  title: 'Tab',
  tags: ['autodocs'],
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <div class="flex flex-row px-2">
    {#each Object.entries(args) as [title]}
      <Tab title={title} />
    {/each}
  </div>
{/snippet}

<Story
  name="Basic"
  args={{
    'title 1': '',
    'title 2': '',
    'title 3': '',
  }} />
