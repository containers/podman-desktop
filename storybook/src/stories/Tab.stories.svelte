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
  args: {
    title: 'Tab',
    selected: false,
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Title of the tab',
      defaultValue: 'Tab',
    },
    selected: {
      control: 'boolean',
      description: 'Flag the tab as being selected',
      defaultValue: false,
    },
  },
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ items }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <div class="flex flex-row px-2">
    {#each items as item}
      <Tab {...item} />
    {/each}
  </div>
{/snippet}

<Story
  name="Basic"
  args={{
    items: [{ title: 'title 1' }, { title: 'title 2' }, { title: 'title 3' }],
  }} />

<Story
  name="Selected"
  args={{
    items: [{ title: 'title 1', selected: false }, { title: 'title 2', selected: true }, { title: 'title 3' }],
  }} />
